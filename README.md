# 📮 MailMate
**MailMate** - Modern Email Client

MailMate is a modern email client built with cutting-edge web technologies to provide a seamless email management experience. With a beautiful UI and powerful features, MailMate helps you stay organized and communicate efficiently.

---

## 🌐 Live Demo

👉 [Click here to try MailMate](https://mail-mate-bay.vercel.app/)  

---

## 🧠 Tech Stack

Built with love using:

- ⚛️ **React** – Component-based frontend library
- 🔐 **Clerk** – User authentication and management
- 🗄️ **Firebase Firestore** – Real-time backend database
- 🔄 **Redux Toolkit** – Scalable state management
- 🎨 **Tailwind CSS** – Utility-first styling
- 🏗️ **ShadCN UI** – Headless accessible UI components
- 🍞 **React Toast** – Elegant toast notifications
- ✨ **Lucide Icons** – Icon set for a sleek UI
- ⌨️ **Jodit Editor** – Rich Text Editor

---

## Features

### 🔐 Secure Authentication
- Secure Login & Logout with Clerk

### 🗄️ Real-time Email Sync
- Seamless integration with Firebase

### 🔄 State Management
- Built using Redux Toolkit

### 🎨 Beautiful UI
- Styled with Tailwind CSS
- Includes ShadCN components

### 📧 Email Management
- ✏️ Compose rich-text emails
- 📥 Inbox with unread counts
- ⭐ Starred messages
- 📤 Sent folder
- 🗑️ Trash with Restore, Delete, Delete Selected, Clear All Trash functionalities

### 📨 Compose Email Modal
- Quickly access **Inbox**, **Starred**, **Sent**, and **Trash** folders in a single view

### 📊 Dashboard Previews
- Displays recent activity from **Inbox** and **Sent** emails for a quick snapshot

### 🔍 Paginated Emails
- Displays 5 emails per page with Next and Previous navigation buttons, using a custom hook to enable reuse across components and enhance optimization.

### ⚡ Real-Time Email Count Sync
- Custom React Hook that tracks and updates real-time counts for Inbox (unread), Starred, Sent and Trash folders.

### 🔔 Notifications
- Toast-based alerts via **React Toastify**

### ✨ Modern Icons
- Provided by **Lucide React**

---

## 📁 Folder Structure

```
MailMate/
├── src/
│ ├── components/
│ │ ├── Layout/
│ │ │ ├── AuthLayout.jsx
│ │ │ ├── EmailModal.jsx
│ │ │ ├── Footer.jsx
│ │ │ ├── Header.jsx
│ │ │ ├── MainLayout.jsx
│ │ │ └── Sidebar.jsx
│ │ ├── ui/
│ │ │ ├── avatar.jsx
│ │ │ ├── badge.jsx
│ │ │ ├── button.jsx
│ │ │ ├── card.jsx
│ │ │ ├── dialog.jsx
│ │ │ ├── input.jsx
│ │ │ └── table.jsx
│ │ ├── EmailModal.jsx
│ │ ├── icons.jsx
│ │ └── PrivateRoute.jsx
│ ├── hooks/
│ │ ├── useMailAPI.js
│ │ ├── usePaginatedEmails.js
│ │ └── useSyncMailCounts.js
│ ├── lib/
│ │ └── utils.js
│ ├── pages/
│ │ ├── Compose.jsx
│ │ ├── Dashboard.jsx
│ │ ├── Home.jsx
│ │ ├── Inbox.jsx
│ │ ├── Profile.jsx
│ │ ├── Sent.jsx
│ │ ├── Starred.jsx
│ │ └── Trash.jsx
│ ├── store/
│ │ ├── emailSlice.js
│ │ └── store.js
│ ├── firebase.js
│ ├── App.jsx
│ ├── inbox.css
│ └── main.jsx
```
---

## 🌟 Key Components

### 🔐 Authentication
- Uses **Clerk** for secure authentication
- Protected routes with `PrivateRoute` component
- User profile management

### ✉️ Email Features
- **Compose**: Rich-text editor with **Jodit**
- **Inbox**: Paginated email list with read/unread status
- **Starred**: Favorite important emails
- **Sent**: View sent messages
- **Trash**: Manage deleted emails with restore functionality

### 🧱 Layout Components
- Custom `Header` with navigation
- `Sidebar` for quick access to folders
- `Footer` highlights the core technologies powering the app
- Responsive layouts via `MainLayout` and `AuthLayout`

### 🎨 UI Components
- Beautiful avatar, badge, button, card, dialog, input and tables from **ShadCN**
- Crisp and modern icons powered by **Lucide Icons**
- Elegant notifications and alerts using **React Toast**

### 🖼️ EmailModal Components
- For viewing emails

### 📚 API & State Management
- **Firebase Firestore**: Stores all email data
- **Redux Toolkit**: Manages application state
  - Tracks email counts (unread, starred, etc.)
  - Maintains email lists for folders
- **Custom hooks**:
  - `useMailAPI`: Email CRUD operations
  - `usePaginatedEmails`: Pagination logic
  - `useSyncMailCounts`: Real-time sync of email counts

### 🎨 Design System
- **Colors**: Gradient backgrounds with vibrant tones
- **Typography**: Clean and readable fonts
- **Icons**: Intuitive **Lucide** icon set
- **Animations**: Smooth transitions and hover effects

### 💤 Lazy Loading Optimization
- To enhance performance and reduce initial load time, MailMate implements lazy loading for key components and routes using React’s **lazy()** and **Suspense**.

---

## 🚀 Future Improvements

- 🔍 Add email search functionality
- 🌙 Add dark mode for better nighttime experience
- 📎 Support for email attachments (images, files, etc.)
- 📩 Enable email forwarding and threaded replies
- 📱 Develop a mobile app version (React Native or Flutter)

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🙌 Support & Contributions

- 🌟 **Star this repo** to show your appreciation
- ✍️ **Fork and submit pull requests** with improvements or fixes
- 🧠 **Share feedback and suggestions** to help shape the future

---
