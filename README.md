# Rant

An anonymous platform for sharing your thoughts, frustrations, and celebrations with the world.

## About Rant

Rant is a modern, anonymous ranting platform that allows users to express themselves freely without revealing their identity. Share your thoughts, vent your frustrations, or celebrate your wins - all in a safe, anonymous environment.

## Features

- **Anonymous Posting**: Share your thoughts without revealing your identity
- **Mood Expression**: Choose from a variety of moods to express how you feel
- **Real-time Updates**: See new rants appear in real-time
- **Interactive UI**: Like, share, and explore rants from others
- **Advanced Filtering**: Filter rants by mood or search for specific content
- **Keyboard Shortcuts**: Navigate and interact efficiently with keyboard shortcuts
- **Responsive Design**: Enjoy a seamless experience on any device
- **Accessibility Options**: Customize your experience with high contrast mode, font size adjustments, and reduced motion
- **Theme Options**: Choose between light, dark, or system theme
- **Internationalization**: Support for multiple languages

## Technologies Used

- **Frontend**:
  - React with TypeScript
  - Vite for fast development and building
  - Tailwind CSS for styling
  - shadcn/ui for UI components
  - Framer Motion for smooth animations
  - React Router for navigation

- **Backend**:
  - Supabase for database and real-time subscriptions
  - CryptoJS for client-side encryption
  - DOMPurify for content sanitization

- **Development Tools**:
  - ESLint and Prettier for code quality
  - React Query for data fetching
  - React Hook Form for form handling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```sh
# Clone the repository
git clone <repository-url>
cd Rant

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start the development server
npm run dev
# or
yarn dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

### Keyboard Shortcuts

Rant comes with a variety of keyboard shortcuts to enhance your experience:

- `n` - Create a new rant
- `e` - Explore rants
- `l` - Sort by latest
- `p` - Sort by popular
- `f` - Filter rants
- `s` - Search rants
- `?` - Show keyboard shortcuts
- `t` - Scroll to top
- `Shift + [Mood Letter]` - Filter by specific mood (e.g., `Shift+S` for Sad)
- `Esc` - Clear all filters

Press `Shift + ?` at any time to view the complete list of shortcuts.

## Deployment

This project can be deployed to any static hosting service:

```sh
# Build the project
npm run build
# or
yarn build

# The build output will be in the 'dist' directory
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Supabase](https://supabase.io/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Framer Motion](https://www.framer.com/motion/) for the smooth animations
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the blazing fast development experience
