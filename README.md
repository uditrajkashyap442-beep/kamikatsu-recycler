# Kamikatsu Zero-Waste Navigator

A modern, full-stack mobile app for Kamikatsu's 43-category waste sorting system.

## Project Structure

```
kamikatsu-complete-fixed/
├── kamikatsu-db/           # PostgreSQL database
│   └── schema.sql          # Database schema with seed data
├── kamikatsu-api/          # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── src/main/resources/application.yml
└── kamikatsu-mobile/       # React Native mobile app
    ├── app/                # Expo Router screens
    ├── constants/          # Theme and configuration
    ├── lib/                # API, store, utilities
    ├── package.json
    └── app.json
```

## Backend Setup (Spring Boot)

### Prerequisites
- Java JDK 21+
- Maven 3.9+
- PostgreSQL 16+

### Installation Steps

1. **Setup PostgreSQL Database**
   ```bash
   # Windows - In pgAdmin
   - Create database: kamikatsu
   - Load schema: kamikatsu-db/schema.sql
   ```

2. **Update Database Password**
   - Edit `kamikatsu-api/src/main/resources/application.yml`
   - Line 11: Set `password:` to your PostgreSQL password
   - Default: `postgres123`

3. **Run Backend**
   ```bash
   cd kamikatsu-api
   mvn clean spring-boot:run
   ```
   - Wait for: `Started KamikatsuApiApplication`
   - Server runs on: `http://localhost:8080/api`

4. **Test API**
   - Open browser: `http://localhost:8080/api/search?q=plastic`
   - Should return JSON with search results

## Frontend Setup (React Native + Expo)

### Prerequisites
- Node.js 18+ with npm
- Expo CLI (optional but recommended)
- iPhone with Expo Go app OR Android emulator

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd kamikatsu-mobile
   npm install
   ```

2. **Update API Endpoint**
   - Edit `lib/api.ts` line 4
   - For Android emulator: `http://10.0.2.2:8080/api` (default)
   - For real device: Change to your PC's LAN IP
     ```bash
     # Windows: Run ipconfig
     # Find: IPv4 Address (e.g., 192.168.1.100)
     # Set: http://192.168.1.100:8080/api
     ```

3. **Start Development Server**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on Device**
   - **Android**: Press `a` → Choose emulator or device
   - **iOS**: Press `i` → Choose simulator
   - **Web**: Press `w` → Opens browser at localhost:8081
   - **Phone**: Scan QR code with Expo Go app

## Features

### Mobile App Tabs

1. **Home** 🏠
   - Dashboard with quick actions
   - Your score/points tracker
   - Waste categories overview
   - Educational tips

2. **Search** 🔍
   - Debounced search for items
   - Recent search history
   - Popular items suggestions
   - Detailed product information

3. **Scan** 📸
   - QR code scanner
   - Camera permission handling
   - Torch control
   - Instant product lookup

4. **Learn** 📚
   - Educational guides for each category
   - Disposal best practices
   - Sustainability tips
   - Community impact information

5. **Profile** 👤
   - User score tracking
   - Achievements unlocked
   - Statistics dashboard
   - Session information

### API Endpoints

- `GET /api/search?q={query}` - Search products
- `GET /api/search/product/{id}` - Get product details
- `GET /api/search/category/{code}` - Get category info
- `POST /api/search/qr-scan` - Log QR scan

## Color Scheme

Modern green theme emphasizing sustainability:
- **Primary**: `#2d5016` (Dark Green)
- **Accent**: `#7cb342` (Light Green)
- **Background**: `#f5f7f3` (Off-White)
- **Text**: `#1a1a1a` (Dark)

## Database Schema

### Tables
- `main_types` - 13 waste categories
- `categories` - 18 sub-categories
- `products` - 41+ household items
- `qr_scans` - User interaction logs

## Troubleshooting

### Backend Issues

**Error: "password authentication failed"**
- Check PostgreSQL password in `application.yml`
- Restart PostgreSQL service
- Verify database exists: `kamikatsu`

**Error: "Connection refused"**
- Ensure PostgreSQL is running
- Check port 5432 is available
- Run: `mvn clean spring-boot:run`

### Frontend Issues

**API requests fail**
- Verify backend is running on port 8080
- Check API endpoint in `lib/api.ts`
- For real device: Ensure computer and phone on same WiFi

**Camera permission denied**
- Grant permission when prompted
- Android: Check app permissions in Settings
- iOS: Settings → Camera → Kamikatsu

**QR Scanner not working**
- Ensure good lighting
- Keep device steady
- Verify QR code format (product ID as number)

## Development Notes

### File Organization
- **API Layer**: `lib/api.ts` - All backend calls
- **State Management**: `lib/store.ts` - Zustand store
- **Theme**: `constants/theme.ts` - Colors, spacing, styles
- **Components**: Screens under `app/(tabs)/`

### Key Technologies
- **Backend**: Spring Boot 3.3, PostgreSQL, JPA/Hibernate
- **Frontend**: React Native, Expo Router, TypeScript
- **State**: Zustand
- **HTTP**: Axios
- **UI**: Native components with Expo Linear Gradient

## Next Steps

1. ✅ Run PostgreSQL and load schema
2. ✅ Start Spring Boot backend
3. ✅ Install mobile dependencies
4. ✅ Update API endpoint for your network
5. ✅ Run Expo development server
6. 📱 Test on device

## Support

For issues or questions:
- Check error messages carefully
- Verify all prerequisites are installed
- Ensure backend is running before starting app
- Test API endpoint in browser first

Happy waste sorting! ♻️
