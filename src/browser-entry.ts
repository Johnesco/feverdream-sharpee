/**
 * Fever Dream — Browser Entry Point
 *
 * Connects the story engine to the browser UI and drives
 * the CSS overlay system via semantic events.
 *
 * Zone detection:  world.getLocation() → ROOM_ZONES → data-zone on body
 * Perception sync: PerceptionStateTrait → data-perception on body
 * Event effects:   engine 'event' listener → CSS class toggles + overlays
 */

import { GameEngine } from '@sharpee/engine';
import { WorldModel, EntityType } from '@sharpee/world-model';
import { Parser } from '@sharpee/parser-en-us';
import { LanguageProvider } from '@sharpee/lang-en-us';
import { PerceptionService } from '@sharpee/stdlib';
import { renderToString } from '@sharpee/text-service';
import { AudioManager } from '@sharpee/platform-browser';
import { story } from './index.js';
import { PerceptionStateTrait, ROOM_ZONES } from './perception.js';
import type { Zone } from './perception.js';

// ─── DOM References ────────────────────────────────────────────

let statusLocation: HTMLElement | null;
let statusScore: HTMLElement | null;
let textContent: HTMLElement | null;
let mainWindow: HTMLElement | null;
let commandInput: HTMLInputElement | null;

// ─── Game State ────────────────────────────────────────────────

let engine: GameEngine;
let world: WorldModel;
let commandHistory: string[] = [];
let historyIndex = -1;
let currentTurn = 0;
let currentScore = 0;
let currentZone: Zone | null = null;
const audioManager = new AudioManager();

// ─── Engine Initialization ─────────────────────────────────────

function initializeGame(): void {
  world = new WorldModel();
  const player = world.createEntity('player', EntityType.ACTOR);
  world.setPlayer(player.id);

  const language = new LanguageProvider();
  const parser = new Parser(language);

  if (story.extendParser) {
    story.extendParser(parser);
  }
  if (story.extendLanguage) {
    story.extendLanguage(language);
  }

  const perceptionService = new PerceptionService();

  engine = new GameEngine({
    world,
    player,
    parser,
    language,
    perceptionService,
  });

  // ── Text Output ──
  engine.on('text:output', (blocks, turn) => {
    displayText(renderToString(blocks));
    currentTurn = turn;
    updateStatusLine();
    syncZone();
    syncPerception();
  });

  // ── Event Listener: CSS Effects + Audio ──
  engine.on('event', (event: any) => {
    const type = event.type as string;

    // Forward audio events to shared AudioManager
    if (type.startsWith('audio.')) {
      audioManager.handleAudioEvent(event as { type: string; data: any });
    }

    // Score tracking
    if (type === 'game.score_changed' && event.data) {
      currentScore = event.data.newScore ?? currentScore;
      updateStatusLine();
    }

    // Story events → CSS class triggers
    switch (type) {
      case 'story.event.spectacles-worn':
        triggerEventAnimation('event-spectacles', 800);
        break;

      case 'story.event.glass-break':
        triggerEventAnimation('event-glass-break', 600);
        break;

      case 'story.event.fungus-consumed':
        triggerEventAnimation('event-fungus-consumed', 6000);
        // Perception state starts the 40s container warp (slow onset)
        setTimeout(() => syncPerception(), 2000);
        // Per-character wave kicks in as the warp builds (~5s into container anim)
        setTimeout(() => applyTripChars(), 7000);
        // Remove per-character wrapping as trip winds down
        setTimeout(() => removeTripChars(), 22000);
        break;

      case 'story.event.spray-exposure':
        triggerEventAnimation('event-spray-exposure', 1500);
        setTimeout(() => syncPerception(), 1600);
        break;

      case 'story.event.valve-drain':
        triggerEventAnimation('event-valve-drain', 2000);
        break;

      case 'story.event.valve-flood':
        triggerEventAnimation('event-valve-flood', 3000);
        break;

      case 'story.event.basin-touch':
        triggerEventAnimation('event-basin-touch', 3000);
        break;

      case 'story.event.game-end':
        // Disable input after game ends
        setTimeout(() => {
          if (commandInput) {
            commandInput.disabled = true;
            commandInput.placeholder = event.data?.won ? 'The treatment is complete.' : 'Game over.';
          }
        }, event.data?.won ? 3200 : 3200);
        break;
    }
  });

  engine.setStory(story);
}

// ─── CSS Effect System ─────────────────────────────────────────

/**
 * Add a CSS class to body for the animation duration, then remove it.
 */
function triggerEventAnimation(className: string, durationMs: number): void {
  document.body.classList.add(className);
  setTimeout(() => {
    document.body.classList.remove(className);
  }, durationMs);
}

/**
 * Wrap visible text characters in spans for per-character wave animation.
 * Each non-whitespace character gets a .trip-char span with --i for
 * staggered animation-delay, creating a visible wave across text.
 */
function applyTripChars(): void {
  if (!textContent) return;

  const walker = document.createTreeWalker(textContent, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (node.textContent && node.textContent.trim()) {
      textNodes.push(node);
    }
  }

  let charIndex = 0;
  for (const textNode of textNodes) {
    const text = textNode.textContent || '';
    const fragment = document.createDocumentFragment();
    for (const char of text) {
      if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
        fragment.appendChild(document.createTextNode(char));
      } else {
        const span = document.createElement('span');
        span.className = 'trip-char';
        span.style.setProperty('--i', String(charIndex % 200));
        span.textContent = char;
        fragment.appendChild(span);
        charIndex++;
      }
    }
    textNode.parentNode?.replaceChild(fragment, textNode);
  }
}

/**
 * Remove trip-char spans, restoring normal text flow.
 */
function removeTripChars(): void {
  if (!textContent) return;
  const spans = textContent.querySelectorAll('.trip-char');
  spans.forEach((span) => {
    const text = document.createTextNode(span.textContent || '');
    span.parentNode?.replaceChild(text, span);
  });
  textContent.normalize();
}

/**
 * Sync the data-zone attribute on body to the player's current room.
 */
function syncZone(): void {
  const player = world.getPlayer();
  if (!player) return;

  const locationId = world.getLocation(player.id);
  if (!locationId) return;

  const zone = ROOM_ZONES[locationId];
  if (zone && zone !== currentZone) {
    currentZone = zone;

    // Use view-transition if available
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        document.body.setAttribute('data-zone', zone);
      });
    } else {
      document.body.setAttribute('data-zone', zone);
    }
  }
}

/**
 * Sync the data-perception attribute to the player's perception state.
 */
function syncPerception(): void {
  const player = world.getPlayer();
  if (!player) return;

  const perception = player.get(PerceptionStateTrait);
  if (!perception) return;

  document.body.setAttribute('data-perception', perception.state);
}

// ─── DOM Setup ─────────────────────────────────────────────────

function setupDOM(): void {
  statusLocation = document.getElementById('location-name');
  statusScore = document.getElementById('score-turns');
  textContent = document.getElementById('text-content');
  mainWindow = document.getElementById('main-window');
  commandInput = document.getElementById('command-input') as HTMLInputElement;

  if (!commandInput) {
    console.error('Command input element not found');
    return;
  }

  commandInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory(1);
    }
  });

  // Focus input on click anywhere
  document.addEventListener('click', () => {
    if (commandInput && !commandInput.disabled) {
      commandInput.focus();
    }
  });
}

// ─── Command Handling ──────────────────────────────────────────

async function handleCommand(): Promise<void> {
  if (!commandInput) return;

  const command = commandInput.value.trim();
  if (!command) return;

  audioManager.unlock();
  commandHistory.push(command);
  historyIndex = commandHistory.length;
  commandInput.value = '';

  displayCommand(command);

  try {
    await engine.executeTurn(command);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    displayText(`[Error: ${message}]`);
  }
}

function navigateHistory(direction: number): void {
  if (!commandInput) return;

  const newIndex = historyIndex + direction;
  if (newIndex < 0) return;

  if (newIndex >= commandHistory.length) {
    historyIndex = commandHistory.length;
    commandInput.value = '';
    return;
  }

  historyIndex = newIndex;
  commandInput.value = commandHistory[historyIndex];
  commandInput.setSelectionRange(
    commandInput.value.length,
    commandInput.value.length,
  );
}

// ─── Text Display ──────────────────────────────────────────────

function displayText(text: string): void {
  if (!textContent) return;

  const paragraphs = text.split(/\n\n+/);

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (trimmed) {
      const p = document.createElement('p');
      p.style.whiteSpace = 'pre-line';
      p.textContent = trimmed;
      textContent.appendChild(p);
    }
  }

  scrollToBottom();
}

function displayCommand(command: string): void {
  if (!textContent) return;

  const div = document.createElement('div');
  div.className = 'command-echo';
  div.textContent = `> ${command}`;
  textContent.appendChild(div);

  scrollToBottom();
}

// ─── Status Line ───────────────────────────────────────────────

function updateStatusLine(): void {
  const player = world.getPlayer();
  let locationName = '';

  if (player) {
    const locationId = world.getLocation(player.id);
    if (locationId) {
      const room = world.getEntity(locationId);
      if (room) {
        locationName = room.name || 'Unknown';
      }
    }
  }

  if (statusLocation) {
    statusLocation.textContent = locationName;
  }

  if (statusScore) {
    statusScore.textContent = `Turns: ${currentTurn}`;
  }
}

function scrollToBottom(): void {
  if (mainWindow) {
    mainWindow.scrollTop = mainWindow.scrollHeight;
  }
}

// ─── Start ─────────────────────────────────────────────────────

async function start(): Promise<void> {
  try {
    setupDOM();
    initializeGame();

    await engine.start();
    await engine.executeTurn('look');

    // Sync initial zone
    syncZone();
    syncPerception();

    if (commandInput) {
      commandInput.focus();
    }
  } catch (error) {
    console.error('=== STARTUP ERROR ===', error);
    displayText(`[Startup Error: ${error}]`);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
