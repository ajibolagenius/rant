# Rant

Rant is a web application that provides a safe, anonymous space for users to express their unfiltered thoughts. Think of it like a digital wall where you can write whatever is on your mind without revealing who you are. Users can share their rants, explore others' rants, and interact with the community through likes and mood-based filtering.

## How It Works

When you open Rant, it connects to the Supabase database to fetch existing rants. These are displayed in a scrollable list, with the newest ones typically appearing first. The app implements "infinite scrolling," which means as you scroll down, it automatically loads more rants without you having to click a "next page" button.

When you write a rant, the application:
1. Takes your text input and mood selection
2. Sends this data to the Supabase database
3. The database stores your rant
4. Through Supabase's real-time features, your rant appears immediately on everyone's feed

The application also includes visual elements like particle animations in the background to make the experience more engaging and dynamic.

## Features

- **Anonymous Ranting**: Share your thoughts without revealing your identity.
- **Mood Selection**: Choose from a variety of moods to categorize your rant.
- **Real-Time Updates**: See new rants and updates in real-time using Supabase.
- **Infinite Scrolling**: Explore rants seamlessly with infinite scrolling.
- **Mood-Based Filtering**: Filter rants based on selected moods.
- **Responsive Design**: Fully responsive UI for desktop, tablet, and mobile devices.
- **Interactive Particles**: Engaging particle background for a dynamic experience.
- **Enhanced Animations**: Smooth transitions and animations for an improved user experience.

## User Flow

1. **Browsing Rants**: When you first visit Rant, you'll see a feed of anonymous rants from other users. Scroll down to explore more content - the app will automatically load more rants as you reach the bottom.

2. **Creating a Rant**: To share your thoughts:
   - Click on the "Create Rant" button
   - Type your message in the text area
   - Select a mood that matches your rant
   - Submit your rant to share it anonymously

3. **Interacting with Rants**: You can interact with other users' rants by:
   - Liking rants that resonate with you
   - Filtering rants by mood to find content that matches your interests

4. **Real-time Experience**: All interactions happen in real-time - when someone posts a new rant, it appears in everyone's feed immediately without requiring a page refresh.

## Technologies Used

- **Frontend**: React, Framer Motion, Notistack
- **Backend**: Supabase (PostgreSQL, Realtime Database)
- **Styling**: CSS, custom animations, and gradients
- **Build Tool**: Vite
- **Utilities**: Floating UI, Lucide Icons
- **Particles**: tsParticles

## Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account for backend setup

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ajibolagenius/rant.git
   cd rant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     VITE_SUPABASE_URL=your-supabase-url
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open the app in your browser at `http://localhost:5173`.

### Building for Production

To build the project for production:
```bash
npm run build
```

The output will be in the `dist` directory.

### Linting

Run the linter to check for code quality:
```bash
npm run lint
```

## Project Structure

```
rant/
├── public/                 # Static assets (images, icons, etc.)
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/              # Page-level components
│   ├── styles/             # Global and component-specific styles
│   ├── utils.js            # Utility functions
│   ├── supabaseClient.js   # Supabase client setup
│   └── main.jsx            # Entry point for the app
├── .gitignore              # Files and directories to ignore in Git
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

## Key Components

- **RantForm**: Allows users to submit their rants with mood selection. This component captures user input and sends it to the database.
- **RantList**: Displays a list of rants with infinite scrolling and filtering. As users scroll down, it automatically fetches more content.
- **RantCard**: Represents individual rants with like, comment, and share actions. Each card shows the rant content and associated mood.
- **IntroSection**: Welcomes users and provides an overview of the app.
- **ParticleBackground**: Adds an interactive particle effect to the background for visual engagement.
- **Footer**: Provides navigation and additional information at the bottom of the page.
- **MoodFilter**: Enables users to filter rants by specific moods, querying the database to show only matching content.

## Recent Updates

- **Enhanced Animations**: Added smooth transitions for card expansions and interactions.
- **Responsive Enhancements**: Improved layout and styles for better usability on smaller screens.
- **Dynamic Overlays**: Subtle overlay effects for expanded cards on desktop.
- **Custom Scrollbars**: Styled scrollbars for a consistent look across browsers.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your fork:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.com) for the backend services.
- [Framer Motion](https://www.framer.com/motion/) for animations.
- [tsParticles](https://particles.js.org/) for the particle effects.
- [Lucide Icons](https://lucide.dev/) for the icons.

Happy ranting! 🎉
