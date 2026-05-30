# Evolution Simulation

A biological evolution simulation built with TypeScript and Vite, featuring complex interactions between different species and an optimized spatial grid system.

## ✨ Features

- **Daily Simulation Cycle**: Creatures forage, eat, and rest in a daily rhythm.
- **Natural Selection**: Reproduction and mortality are driven by food acquisition (feedScore).
- **Multiple Species**: 
  - **Seeker**: Standard foraging creature.
  - **Raider**: Aggressive species that can steal 75% of a Seeker's food.
  - **Swift**: High-speed foragers.
  - **Titan**: Large, high-endurance creatures.
- **Optimized Foraging**: Uses a **SpatialGrid** system for efficient food localization with concentric ring searching and mathematical early-exit.
- **Food Dynamics**: Resources can be shared between up to two creatures simultaneously.
- **Real-time Interaction**:
  - **Inspector**: Click on any creature or food source to view real-time data (status, position, velocity, targets).
  - **HUD & Controls**: Integrated **Tweakpane** for controlling simulation speed, food abundance, population graphs, and manual day skipping.
- **Visual Effects**: Dynamic spawn effects and smooth animations.
- **Responsive Logic**: 100x100 logical grid independent of screen resolution.

## 🚀 Tech Stack

- **Language**: TypeScript
- **Bundler**: Vite
- **UI Controls**: Tweakpane
- **Graphics**: Canvas API

## 🛠️ Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 🎮 How it works

1. **Spawn**: Choose your initial population distribution on the landing screen.
2. **Survival**: Creatures search for food each day. Their success determines if they survive and reproduce.
3. **Evolution**: Monitor population trends through the integrated HUD graphs.
4. **Inspect**: Click on creatures to follow their behavior and stats in detail.
