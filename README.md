# MPM - Project Manager

A React Native mobile application for managing projects and tasks with a Kanban board interface.

## 📱 Overview

MPM (Project Manager) is a cross-platform mobile application built with React Native that helps users organize and manage their projects and tasks efficiently. The app features a modern UI with dark/light theme support, drag-and-drop task management, and real-time sync simulation.

## 🚀 Setup Steps

### Prerequisites

- Node.js >= 20
- React Native development environment
- Android Studio (for Android)
- Xcode (for iOS - macOS only)
- Java Development Kit (JDK)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MPM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Run the application**
   ```bash
   # Start Metro bundler
   npm start

   # Run on Android
   npm run android

   # Run on iOS
   npm run ios
   ```

## ✨ Features

### Project Management
- Create, view, and delete projects
- Swipeable project cards with delete and open actions
- Search projects by name
- Circular progress bar showing task completion percentage
- Project count display

### Task Management
- Kanban board with three columns: To Do, In Progress, Done
- Drag-and-drop tasks between columns
- Create, edit, and delete tasks
- Task details include:
  - Title and description
  - Due date (DD-MM-YYYY format)
  - Assigned user
  - Estimated hours
  - Status (To Do, In Progress, Done)
  - Task image attachment

### User Interface
- Dark and light theme support with theme toggle
- Splash screen with Lottie animation
- Smooth animations and transitions
- Keyboard-aware input fields
- Responsive design for all screen sizes

### Data Management
- Local data persistence using AsyncStorage
- Real-time sync simulation (fake API)
- Automatic data sync on:
  - App open
  - Project switch
  - Task update

### Additional Features
- Image picker with gallery permissions
- Date picker for task due dates
- Flash messages for success/error notifications
- Global loading indicator
- Portrait mode lock
- Font scaling disabled for consistent UI

## 📚 Libraries Used

### Core
- **React Native** (0.82.1) - Framework
- **React** (19.1.1) - UI library
- **TypeScript** - Type safety

### Navigation
- **@react-navigation/native** (^7.1.21) - Navigation framework
- **@react-navigation/native-stack** (^7.6.4) - Stack navigator

### State Management
- **@reduxjs/toolkit** (^2.10.1) - Redux toolkit
- **react-redux** (^9.2.0) - React bindings
- **redux-persist** (^6.0.0) - State persistence

### UI & Animations
- **react-native-reanimated** (^4.1.5) - Animations
- **react-native-gesture-handler** (^2.29.1) - Gestures
- **react-native-gifted-charts** (^1.4.66) - Circular progress
- **lottie-react-native** (^7.3.4) - Lottie animations
- **react-native-flash-message** (^0.4.2) - Flash messages

### Utilities
- **@react-native-async-storage/async-storage** (^2.2.0) - Local storage
- **moment** (^2.30.1) - Date formatting
- **react-native-image-picker** (^8.2.1) - Image selection
- **react-native-permissions** (^5.4.4) - Permission handling
- **react-native-modal-datetime-picker** (^18.0.0) - Date picker

### Platform
- **react-native-safe-area-context** (^5.5.2) - Safe area handling
- **react-native-screens** (^4.18.0) - Native screens

## 🔄 App Flow

### Navigation Structure
```
SplashScreen (3 seconds)
    ↓
ProjectList (Home Screen)
    ↓
KanbanBoard (Project Tasks)
    ↓
TaskDetails (Edit/Create Task)
```

### Screen Flow

1. **Splash Screen**
   - Shows app logo with Lottie animation
   - Displays for 3 seconds
   - Loads theme preference

2. **Project List Screen**
   - Displays all projects with completion progress
   - Search functionality
   - Swipe left → Delete project
   - Swipe right → Open project
   - Tap project card → Navigate to Kanban board
   - Theme toggle in header

3. **Kanban Board Screen**
   - Three columns: To Do, In Progress, Done
   - Drag and drop tasks between columns
   - Add new tasks
   - Tap task → Navigate to task details

4. **Task Details Screen**
   - View/edit task information
   - Upload/change task image
   - Set due date with date picker
   - Update task status
   - Delete task

### Data Flow

1. **On App Open**
   - Load projects from AsyncStorage
   - Sync with fake server
   - Update Redux store

2. **On Project Switch**
   - Set current project in Redux
   - Sync project data
   - Navigate to Kanban board

3. **On Task Update**
   - Update task in Redux store
   - Sync with fake server
   - Show success/error message

## 🏗️ Build Android APK

### Release Build

1. **Keystore is already configured** in `android/keystore.properties`

2. **Build release APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. **APK Location**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### Important Notes
- Keystore file: `android/app/mpm-release-key.keystore`
- Keystore credentials: `android/keystore.properties`
- **Keep keystore files secure** - they are in `.gitignore`

## 📁 Project Structure

```
MPM/
├── src/
│   ├── components/       # Reusable components
│   ├── screens/          # Screen components
│   ├── navigations/      # Navigation setup
│   ├── redux/            # State management
│   ├── themes/           # Colors, fonts, spacing
│   ├── utils/            # Utilities & constants
│   ├── helper/           # Helper functions
│   └── hooks/            # Custom hooks
├── android/              # Android native code
├── ios/                  # iOS native code
└── App.tsx               # Root component
```

## 🔧 Configuration

### Theme
- Theme configuration: `src/themes/colors.js`
- Supports dark and light themes
- Theme preference persisted in AsyncStorage

### Constants
- All static strings: `src/utils/appConstants.ts`
- Validation messages: `src/utils/validationConstants.js`

### Permissions
- Android: Configured in `android/app/src/main/AndroidManifest.xml`
- iOS: Configured in `ios/MPM/Info.plist`

## 📝 Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run lint` - Run ESLint

## 🔒 Security Notes

- Keystore files are excluded from version control
- Sensitive credentials in `keystore.properties` (not committed)
- For production, use strong passwords and secure keystore storage

---

**Version:** 1.0  
**Platform:** Android & iOS  
**Language:** TypeScript/JavaScript
