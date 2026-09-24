import { useEffect, useState } from "react";
import { request } from "../api";

// events list. staff can add, admin/hod can delete
function Events({ user }) {
  // list + form boxes
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");

  // who can do what
  const canPost = user.role !== "student";
  const canDelete = user.role === "admin" || user.role === "hod";

  // get all events (backend sorts by date)
  const loadEvents = () => {
    request("/events").then(setEvents);
  };

  // on open -> load events
  useEffect(() => {
    loadEvents();
  }, []);

  // add event, clear form, reload
  const addEvent = async (e) => {
    e.preventDefault();
    await request("/events", "POST", { title, description, date, venue });
    setTitle("");
    setDescription("");
    setDate("");
    setVenue("");
    loadEvents();
  };

  // delete then reload
  const deleteEvent = async (id) => {
    await request("/events/" + id, "DELETE");
    loadEvents();
  };

  return (
    <div>
      {/* add form, not for students */}
      {canPost && (
        <div className="card">
          <h3>Add Event</h3>
          <form onSubmit={addEvent} className="grid">
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <input placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
            <button className="action" type="submit">Add</button>
          </form>
        </div>
      )}
      <div className="card">
        <h3>Upcoming Events</h3>
        {/* each event */}
        {events.map((ev) => (
          <div key={ev._id} className="item">
            <b>{ev.title}</b> <span className="badge">{ev.date}</span>
            {canDelete && <button className="small danger right" onClick={() => deleteEvent(ev._id)}>Delete</button>}
            <p>{ev.description}</p>
            <p className="muted">Venue: {ev.venue || "-"}</p>
          </div>
        ))}
        {events.length === 0 && <p>No events.</p>}
      </div>
    </div>
  );
}

export default Events;
