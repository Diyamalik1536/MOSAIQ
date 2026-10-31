export const initialNotifications = [
  {
    id: 'n1',
    title: 'New Student Application',
    message: 'Alex Johnson applied for the Senior Frontend Developer position in your project.',
    type: 'applications',
    timestamp: '10 minutes ago',
    read: false,
    applicationId: 'app_001',
    user: {
      name: 'Alex Johnson',
      role: 'Computer Science, Senior'
    }
  },
  {
    id: 'n2',
    title: 'Project Collaboration Invitation',
    message: 'Sarah Jenkins invited you to join the UI/UX design team for the Hackathon project.',
    type: 'applications',
    timestamp: '45 minutes ago',
    read: false,
    actionUrl: '/students',
    user: {
      name: 'Sarah Jenkins',
      role: 'Design & HCI, Junior'
    }
  },
  {
    id: 'n3',
    title: 'Connection Request Accepted',
    message: 'David Chen accepted your invitation to connect on AI Talent Search.',
    type: 'connections',
    timestamp: '2 hours ago',
    read: false,
    actionUrl: '/connections',
    user: {
      name: 'David Chen',
      role: 'Data Science, Graduate'
    }
  },
  {
    id: 'n4',
    title: 'Mentor Connection Recommendation',
    message: 'Campus Mentor Prof. Marcus Vance is open for 1-on-1 career guidance sessions.',
    type: 'connections',
    timestamp: '5 hours ago',
    read: true,
    actionUrl: '/connections',
    user: {
      name: 'Prof. Marcus Vance',
      role: 'Faculty Mentor'
    }
  },
  {
    id: 'n5',
    title: 'Team Application Update',
    message: 'Emily Zhang shortlisted your application for the "EcoTrack Mobile App" team.',
    type: 'applications',
    timestamp: '1 day ago',
    read: true,
    actionUrl: '/students',
    user: {
      name: 'Emily Zhang',
      role: 'Software Engineering, Junior'
    }
  }
];
