export const shows = [
  {
    _id: "s1",
    movie: "m1", // Refers to movie ID
    theatre: "t1", // Refers to theatre ID
    screenName: "Screen 1",
    date: new Date().toISOString().split("T")[0],
    startTime: "18:00",
    endTime: "21:00",
    price: 15,
    status: "booking_open",
    bookedSeats: ["A1", "A2", "C5"]
  },
  {
    _id: "s2",
    movie: "m2", 
    theatre: "t1",
    screenName: "Screen 2",
    date: new Date().toISOString().split("T")[0],
    startTime: "20:00",
    endTime: "23:00",
    price: 12,
    status: "booking_open",
    bookedSeats: ["B3", "B4"]
  }
];
