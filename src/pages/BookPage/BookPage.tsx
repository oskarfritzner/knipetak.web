import React from "react";
import BookingCalendar from "../../components/BookingCalendar/BookingCalendar";
import "./BookPage.css";

const BookPage: React.FC = () => {
  return (
    <>
      <div className="book-page">
        <h1>Book en time</h1>
        <BookingCalendar />
      </div>
    </>
  );
};

export default BookPage;
