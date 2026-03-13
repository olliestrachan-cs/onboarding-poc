# Cloudsmith Onboarding Hub

A lightweight, React-based single-page application (SPA) designed to manage, track, and report on customer onboarding projects. Built with a focus on ease-of-use and quick deployment, it requires no complex build tools and runs entirely in the browser using Babel standalone.

## ✨ Key Features

### 📊 Global Dashboard & Portfolio Management
* **High-Level Stats:** Instantly view active onboardings and their current RAG (Red, Amber, Green) statuses.
* **Global Gantt Timeline:** A visual timeline showing all active customer onboardings, their start/target dates, and current progress.
* **Portfolio Table:** A comprehensive, sortable, and filterable list of all customers. Filter by RAG status, current phase, tier, or onboarding manager. Track baseline vs. forecast completion dates and identify slipping timelines.

### 🏢 Deep-Dive Customer View
Manage individual customer onboardings through a dedicated, tabbed interface:
* **Plan (Gantt Chart):** A detailed, interactive Gantt chart tracking Level 0 (Phases) and Level 1 (Sub-milestones) progress. Includes one-click exports to **SVG** and **PNG** for easy sharing in presentations or reports.
* **Milestones Tracker:** Manage L0 phases (e.g., Kickoff, Discovery, Rollout) and L1 sub-milestones. 
    * Track Start/End dates, completion status, and RAG status.
    * Map dependencies between milestones (dates cascade automatically if a predecessor shifts).
    * **Path to Green (P2G):** Mandate action plans for Amber and Red milestones.
* **RIDs Register (Risks, Issues, Dependencies):** A dedicated ledger to log project risks, link them to specific milestones, assign owners, and track mitigation strategies.
* **Gong Transcripts:** Log call transcripts. Includes an AI integration to automatically summarize key decisions, blockers, and next steps.
* **AI Weekly Updates:** Generate professional, 150-250 word weekly status reports instantly. The AI aggregates milestone progress, RAG statuses, Path to Green actions, and recent call transcripts to draft leadership-ready updates.

### ⚙️ Settings & Customization
* **Phase Templates:** Customize the default Level 0 lifecycle phases (e.g., Kickoff, Discovery, Configuration, Artifact Migration, Rollout, Decommission) applied to new customers.
* **Customer Tiers:** Define and color-code customer priority tiers (e.g., Strategic, Enterprise, Ultra).

## 🛠️ Tech Stack

This project is built to be extremely portable with a "zero-build" philosophy:
* **React 18:** For reactive, component-based UI.
* **Tailwind CSS:** Loaded via CDN for rapid, utility-first styling.
* **Babel Standalone:** Compiles JSX directly in the browser, removing the need for Webpack or Vite during local development.
* **Anthropic API (Claude):** Integrated for summarizing call transcripts and generating weekly status updates.

## 📁 Project Structure

* `index.html`: The entry point. Loads React, ReactDOM, Babel, and Tailwind CSS. It sets up the root DOM node and fetches the JSX application.
* `cloudsmith-onboarding-hub.jsx`: The monolithic application file containing all state management, UI components, styling overrides, data structures, and API logic.

## 🚀 Getting Started

Because the project fetches the `.jsx` file via a `<script>` tag, modern browser CORS policies require it to be served over HTTP rather than opening the file directly from your local filesystem (`file://`).

### Prerequisites
You only need a basic local web server. 

### Running Locally
1. Clone the repository:
   ```bash
   git clone [https://github.com/olliestrachan-cs/onboarding-poc.git](https://github.com/olliestrachan-cs/onboarding-poc.git)
   cd onboarding-poc
2. Start a local web server in the directory. 
* Node (npx): npx http-server
* Open your browser and navigate to http://localhost:8000 (or the port provided by your server).
