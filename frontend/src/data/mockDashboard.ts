export const mockDashboard = {
  user: {
    name: "Kavya",
  },

  upcomingTrips: [
    {
      id: "japan-2026",
      title: "Japan Adventure",
      location: "Tokyo · Kyoto · Osaka",
      dates: "12 Sep — 18 Sep 2026",
      duration: "7 days",
      destinations: 3,
      image:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "europe-2026",
      title: "European Summer",
      location: "Paris · Rome · Barcelona",
      dates: "04 Oct — 14 Oct 2026",
      duration: "11 days",
      destinations: 3,
      image:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    },
  ],

  destinations: [
    {
      id: "tokyo",
      name: "Tokyo",
      country: "Japan",
      description: "Neon nights, quiet temples and endless discovery.",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80",
      costIndex: "Moderate",
      popularity: "Very popular",
    },
    {
      id: "kyoto",
      name: "Kyoto",
      country: "Japan",
      description: "Ancient streets, gardens and timeless culture.",
      image:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
      costIndex: "Moderate",
      popularity: "Popular",
    },
    {
      id: "paris",
      name: "Paris",
      country: "France",
      description: "Art, architecture and unforgettable city walks.",
      image:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
      costIndex: "High",
      popularity: "Very popular",
    },
  ],

  budget: {
    total: 60000,
    spent: 42800,
    categories: {
      transport: 12400,
      stay: 18200,
      activities: 7800,
      food: 4400,
    },
  },
}