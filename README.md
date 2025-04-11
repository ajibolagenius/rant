# Rant

Rant is a React-based web application that provides a safe, anonymous space for users to express their unfiltered thoughts. Users can share their rants, explore others' rants, and interact with the community through likes and mood-based filtering.

## Features

- **Anonymous Ranting**: Share your thoughts without revealing your identity.
- **Mood Selection**: Choose from a variety of moods to categorize your rant.
- **Real-Time Updates**: See new rants and updates in real-time using Supabase.
- **Infinite Scrolling**: Explore rants seamlessly with infinite scrolling.
- **Mood-Based Filtering**: Filter rants based on selected moods.
- **Responsive Design**: Fully responsive UI for desktop, tablet, and mobile devices.
- **Interactive Particles**: Engaging particle background for a dynamic experience.

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

- **RantForm**: Allows users to submit their rants with mood selection.
- **RantList**: Displays a list of rants with infinite scrolling and filtering.
- **RantCard**: Represents individual rants with like, comment, and share actions.
- **IntroSection**: Welcomes users and provides an overview of the app.
- **ParticleBackground**: Adds an interactive particle effect to the background.

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
