# Sea & Tea Tours - Tour Agency Website

A modern React-based tour agency website that connects travel guides with tourists, built with mock data that can easily be replaced with real API calls.

## 🌟 Features

### For Tourists
- **Browse Tours**: View available tours with detailed information, pricing, and availability
- **Find Guides**: Search and filter local guides by location, language, and specialties
- **Tour Details**: Comprehensive tour information including itineraries, what's included, and reviews
- **Guide Profiles**: Detailed guide information with certifications, experience, and contact details
- **User Authentication**: Secure login and registration system

### For Travel Guides
- **Profile Management**: Showcase expertise, certifications, and tour offerings
- **Tour Management**: Display tour details, pricing, and availability
- **Contact Integration**: Direct communication with potential clients

### General Features
- **Responsive Design**: Mobile-first approach with beautiful UI/UX
- **Search & Filtering**: Advanced search capabilities for tours and guides
- **Modern UI**: Built with Tailwind CSS for a professional, polished look
- **Mock Data System**: Easy to replace with real API endpoints

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd seaandtea-tours
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.js       # Navigation component
│   └── Footer.js       # Footer component
├── pages/              # Page components
│   ├── Home.js         # Homepage
│   ├── Guides.js       # Guides listing page
│   ├── Tours.js        # Tours listing page
│   ├── GuideProfile.js # Individual guide profile
│   ├── TourDetail.js   # Individual tour details
│   ├── About.js        # About page
│   ├── Contact.js      # Contact page
│   ├── Login.js        # Login form
│   └── Register.js     # Registration form
├── data/               # Mock data and API functions
│   └── mockData.js     # All mock data and helper functions
├── App.js              # Main app component with routing
├── index.js            # Entry point
└── index.css           # Global styles and Tailwind imports
```

## 📊 Mock Data Structure

The application uses a comprehensive mock data system that simulates real API calls:

### Guides Data
- Personal information (name, bio, image)
- Location and languages
- Ratings and reviews
- Specialties and certifications
- Contact information

### Tours Data
- Tour details (title, description, pricing)
- Itinerary and highlights
- What's included/excluded
- Availability dates
- Guide information

### Helper Functions
- `getGuides()` - Fetch all guides
- `getTours()` - Fetch all tours
- `searchGuides(filters)` - Search guides with filters
- `searchTours(filters)` - Search tours with filters
- `getGuideById(id)` - Get specific guide
- `getTourById(id)` - Get specific tour

## 🔄 Replacing Mock Data with Real APIs

To connect with real data sources, simply replace the functions in `src/data/mockData.js`:

```javascript
// Replace this:
export const getGuides = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockGuides), 500);
  });
};

// With this:
export const getGuides = async () => {
  try {
    const response = await fetch('/api/guides');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching guides:', error);
    throw error;
  }
};
```

## 🎨 Styling

The application uses **Tailwind CSS** for styling with a custom color scheme:

- **Primary Colors**: Blue tones for main elements
- **Secondary Colors**: Yellow tones for accents
- **Custom Components**: Pre-built button and form styles
- **Responsive Design**: Mobile-first approach with breakpoints

## 🧭 Navigation

The website includes the following main routes:

- `/` - Homepage with featured destinations
- `/guides` - Browse and search travel guides
- `/tours` - Browse and search available tours
- `/guide/:id` - Individual guide profile
- `/tour/:id` - Individual tour details
- `/about` - Company information and mission
- `/contact` - Contact form and information
- `/login` - User authentication
- `/register` - User registration

## 🔧 Customization

### Adding New Tours
Add tour data to the `mockTours` array in `src/data/mockData.js`:

```javascript
{
  id: 5,
  title: 'New Tour Name',
  image: 'image-url',
  location: 'Location',
  category: 'Category',
  price: 999,
  // ... other properties
}
```

### Adding New Guides
Add guide data to the `mockGuides` array:

```javascript
{
  id: 5,
  name: 'Guide Name',
  image: 'image-url',
  location: 'Location',
  // ... other properties
}
```

### Modifying Styling
Update colors and styles in `tailwind.config.js` and `src/index.css`.

## 🚀 Deployment

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`

### Vercel
1. Import your GitHub repository
2. Vercel will auto-detect React settings
3. Deploy with default configuration

### Traditional Hosting
1. Run `npm run build`
2. Upload the `build` folder to your web server
3. Configure your server for single-page application routing

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔒 Security Features

- Form validation on client-side
- Password strength requirements
- Secure routing with React Router
- Input sanitization (ready for backend integration)

## 🧪 Testing

```bash
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support or questions, please open an issue in the GitHub repository.

## 🔮 Future Enhancements

- **Real-time Chat**: Direct messaging between guides and tourists
- **Payment Integration**: Secure booking and payment processing
- **Review System**: User-generated reviews and ratings
- **Multi-language Support**: Internationalization for global users
- **Mobile App**: React Native companion app
- **Admin Dashboard**: Guide and tour management system
- **Analytics**: Booking and user behavior tracking

---

**Built with ❤️ using React, Tailwind CSS, and modern web technologies**

