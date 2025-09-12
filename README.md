# SHG-Connect

A comprehensive digital platform for Self-Help Group (SHG) management, designed to streamline operations, enhance member engagement, and facilitate financial inclusion for community-based microfinance organizations.

## 🌟 Overview

SHG-Connect is a modern web application that digitizes Self-Help Group operations, making it easier for group leaders, members, and administrators to manage their financial activities, meetings, and community development initiatives. The platform serves as a bridge between traditional SHG practices and digital efficiency.

**Live Demo:** [View on Lovable](https://lovable.dev/projects/46c80fd1-b82a-4e1e-8c69-92810ab3d7b4)

## ✨ Features

### 👥 Member Management
- **Member Registration**: Easy onboarding process for new SHG members
- **Profile Management**: Comprehensive member profiles with contact information and financial history
- **Role-based Access**: Different access levels for leaders, members, and administrators
- **Member Directory**: Searchable directory of all group members

### 💰 Financial Management
- **Savings Tracking**: Monitor individual and group savings contributions
- **Loan Management**: Track loan applications, approvals, and repayments
- **Transaction History**: Detailed financial transaction records
- **Interest Calculations**: Automated interest computation for loans and savings
- **Financial Reports**: Generate comprehensive financial statements and reports

### 📅 Meeting Management
- **Meeting Scheduling**: Plan and schedule regular SHG meetings
- **Attendance Tracking**: Digital attendance management system
- **Meeting Minutes**: Record and store meeting minutes and decisions
- **Agenda Management**: Create and distribute meeting agendas

### 📊 Analytics & Reporting
- **Financial Analytics**: Visual charts and graphs for financial performance
- **Member Performance**: Track individual member contributions and participation
- **Group Performance**: Overall group health and progress monitoring
- **Export Capabilities**: Generate and export reports in various formats

### 🔔 Communication Tools
- **Notifications**: Automated reminders for meetings, payments, and important events
- **Messaging System**: Internal communication platform for members
- **Announcements**: Broadcast important information to all members

## 🚀 Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for responsive and modern UI
- **UI Components**: shadcn/ui for consistent and accessible components
- **State Management**: React hooks and context API
- **Development Platform**: Built with Lovable for rapid development

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (version 16.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

We recommend using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to manage Node.js versions.

## 🛠️ Installation & Setup

### Method 1: Using Lovable (Recommended)

1. Visit the [Lovable Project](https://lovable.dev/projects/46c80fd1-b82a-4e1e-8c69-92810ab3d7b4)
2. Start making changes using natural language prompts
3. Changes are automatically committed to the repository

### Method 2: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/naakaarafr/SHG-Connect.git
   cd SHG-Connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Method 3: GitHub Codespaces

1. Navigate to the repository on GitHub
2. Click the "Code" button (green button)
3. Select the "Codespaces" tab
4. Click "New codespace" to launch the environment
5. Run `npm install && npm run dev` in the terminal

### Method 4: Direct GitHub Editing

1. Navigate to any file in the repository
2. Click the "Edit" button (pencil icon)
3. Make your changes and commit them directly

## 📁 Project Structure

```
SHG-Connect/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── forms/          # Form components
│   │   ├── charts/         # Data visualization components
│   │   └── layout/         # Layout components
│   ├── pages/              # Application pages/routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── members/        # Member management pages
│   │   ├── finance/        # Financial management pages
│   │   └── meetings/       # Meeting management pages
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── styles/             # Global styles and Tailwind config
│   └── assets/             # Static assets (images, icons)
├── public/                 # Public static files
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.ts         # Vite configuration
└── README.md             # This file
```

## 🎯 Usage

### For SHG Leaders
1. **Set up your group**: Create a new SHG profile with basic information
2. **Add members**: Invite and register group members
3. **Schedule meetings**: Plan regular group meetings and set agendas
4. **Track finances**: Monitor group savings, loans, and transactions
5. **Generate reports**: Create financial and activity reports for stakeholders

### For SHG Members
1. **View your profile**: Check personal financial status and contributions
2. **Track savings**: Monitor your savings growth and interest earned
3. **Apply for loans**: Submit loan applications through the platform
4. **Meeting participation**: Access meeting schedules and submit attendance
5. **Communication**: Stay connected with group announcements and messages

### For Administrators
1. **Oversee multiple groups**: Manage several SHGs from a central dashboard
2. **Monitor performance**: Track overall program effectiveness
3. **Generate reports**: Create comprehensive program reports
4. **System management**: Configure platform settings and user permissions

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-ready application
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks
- `npm run type-check` - Run TypeScript type checking

## 🌐 Deployment

### Automatic Deployment (Lovable)
Changes made through the Lovable platform are automatically deployed. To publish:
1. Open [Lovable Project](https://lovable.dev/projects/46c80fd1-b82a-4e1e-8c69-92810ab3d7b4)
2. Click on **Share** → **Publish**

### Custom Domain
To connect a custom domain:
1. Navigate to **Project** → **Settings** → **Domains**
2. Click **Connect Domain**
3. Follow the [domain setup guide](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

### Manual Deployment
For manual deployment to other platforms:
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

### Reporting Issues
If you find a bug or have a feature request:
1. Check existing issues to avoid duplicates
2. Create a new issue with detailed information
3. Include steps to reproduce (for bugs)
4. Add relevant labels and assignees

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NABARD**: For pioneering the SHG Bank Linkage Program that inspired this platform
- **Rural Women of India**: For their resilience and dedication to community development
- **Ministry of Rural Development**: For promoting financial inclusion and women empowerment
- **Lovable Platform**: For providing an excellent development environment
- **Open Source Contributors**: For their valuable contributions and feedback
- **shadcn/ui**: For accessible UI components suitable for diverse user bases
- **Tailwind CSS**: For responsive design that works across devices and network conditions

## 📞 Support & Contact

For questions, suggestions, or support:

- **🌐 Live Application**: [https://shg-connect.lovable.app/](https://shg-connect.lovable.app/)
- **GitHub Issues**: [Create an issue](https://github.com/naakaarafr/SHG-Connect/issues)
- **Discussions**: [Join community discussions](https://github.com/naakaarafr/SHG-Connect/discussions)
- **Technical Support**: Check the Lovable platform documentation

## 🔮 Roadmap

### Phase 1 (Current) ✅
- ✅ Basic SHG member management
- ✅ Financial tracking and reporting
- ✅ Meeting and attendance management
- ✅ Responsive design for mobile devices
- ✅ Multi-language interface preparation

### Phase 2 (In Progress) 🔄
- 🔄 Regional language support (Hindi, Tamil, Telugu, Bengali, etc.)
- 🔄 Offline functionality for areas with poor connectivity
- 🔄 Integration with banking APIs for real-time transactions
- 🔄 Enhanced mobile experience with PWA capabilities
- 🔄 Voice-based navigation for low-literacy users

### Phase 3 (Planned) ⏳
- ⏳ Integration with government schemes (MGNREGA, PM-KISAN)
- ⏳ Blockchain-based transparent transactions
- ⏳ AI-powered credit scoring for rural women
- ⏳ E-commerce integration for SHG products
- ⏳ Digital payment gateway integration

### Phase 4 (Future Vision) 🚀
- 🚀 Satellite connectivity for remote areas
- 🚀 IoT integration for agricultural SHGs
- 🚀 Advanced analytics for policy makers
- 🚀 Cross-border microfinance capabilities
- 🚀 Climate change adaptation tools

---

**Made with ❤️ for Rural India**

*डिजिटल इंडिया के माध्यम से ग्रामीण महिलाओं का सशक्तिकरण*  
*Empowering Rural Women Through Digital India*

**🇮🇳 Contributing to Atmanirbhar Bharat through Financial Inclusion**
