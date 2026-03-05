export const theatres = [
  {
    _id: "t1",
    name: "PVR Cinemas City Center",
    location: {
      address: "123 Main Street, City Center Mall",
      city: "Metropolis",
      state: "NY",
      zipCode: "10001",
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    screens: [
      {
        name: "Screen 1",
        capacity: 150,
        layout: {
          rows: 10,
          columns: 15
        },
        type: "IMAX"
      },
      {
        name: "Screen 2",
        capacity: 100,
        layout: {
          rows: 10,
          columns: 10
        },
        type: "Standard"
      }
    ],
    facilities: ["Parking", "Food Court", "Wheelchair Accessible"],
    contactNumber: "123-456-7890",
    images: ["https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800"]
  }
];
