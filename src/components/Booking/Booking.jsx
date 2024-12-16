import React, { useState, useEffect } from "react";
import Calendar from "react-calendar"; // Usa la libreria react-calendar
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import "./style.css";

const BookingCreator = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeslots, setTimeSlots] = useState([
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
  ]);
  const [allDates, setAllDates] = useState([]); // Per memorizzare tutte le date disponibili
  const [bookedTimes, setBookedTimes] = useState(new Set()); // Orari prenotati per la data selezionata


  useEffect(() => {
    axios
      .get("http://localhost:4040/availability")
      .then((response) => {
        const dates = response.data.map((item) => item.date);
        setAllDates(dates);
      })
      .catch((err) => console.error("Errore nel caricamento delle date:", err));
  }, []);

  useEffect(() => {
    if (selectedDate) {
      axios
        .get(`http://localhost:4040/availability/${selectedDate}`)
        .then((response) => {
          const availableTimes = new Set(
            response.data.map((element) => element.time)
          );
          setBookedTimes(availableTimes);
          setTimeSlots(timeslots.filter((time) => !availableTimes.has(time)));
        })
        .catch((err) =>
          console.error("Errore nel caricamento degli orari:", err)
        );
    }
  }, [selectedDate]);

  const handleBooking = (time) => {
    console.log("Selezionato:", selectedDate, time);
    axios
      .post("http://localhost:4040/availability/book", {
        date: selectedDate,
        time: time,
      })
      .then(() => {
        alert("Prenotazione effettuata con successo!");
        setBookedTimes((prev) => new Set ([...prev, time]));
        setTimeSlots((prev) => prev.filter((slot) => slot !== time))
        console.log("Payload inviato:", { date: selectedDate, time: time });
      })
      .catch((err) => console.error("Errore nella prenotazione:", err));
  };

  const isDateAvailable = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    return allDates.includes(formattedDate);
  };

  return (
    <div className="booking-container">
      <h1>Crea una Prenotazione</h1>
      <div className="booking-creator">
        <Calendar
          onChange={(date) => {
            const formattedDate = date.toISOString().split("T")[0]; // aaaa-mm-gg
            setSelectedDate(formattedDate);
          }}
          tileClassName={({ date }) =>
            isDateAvailable(date) ? "available-date" : "unavailable-date"
          }
        />
        {selectedDate && (
          <div className="booking-time-container">
            <h2>Orari disponibili per {selectedDate}:</h2>
            <div className="time-container">
              {timeslots.length > 0 ? (
                timeslots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleBooking(time)}
                    className="time-btn"
                    disabled={bookedTimes.has(time)}
                  >
                    {time}
                  </button>
                ))
              ) : (
                <p>Nessun orario disponibile per questa data.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCreator;
