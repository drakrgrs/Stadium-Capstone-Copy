import React, { useState, useEffect } from 'react';

const Admin = ({ token }) => { 
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchReviews();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`, 
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // Fetch all reviews
  const fetchReviews = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  // Delete a review
  const deleteReview = async (reviewId) => {
    try {
      await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setReviews(reviews.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  // Delete a comment
  const deleteComment = async (commentId) => {
    try {
      await fetch(`http://localhost:3000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setReviews(
        reviews.map((review) => ({
          ...review,
          comments: review.comments.filter((comment) => comment.id !== commentId),
        }))
      );
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <section>
        <h2>Manage Users</h2>
        {users.length === 0 ? (
          <p>No users available.</p>
        ) : (
          users.map((user) => (
            <div key={user.id}>
              <h3>{user.username} ({user.email})</h3>
              <p>First Name: {user.firstName}</p>
              <p>Last Name: {user.lastName}</p>
            </div>
          ))
        )}
      </section>

      <section>
        <h2>Manage Reviews & Replies</h2>
        {reviews.length === 0 ? (
          <p>No reviews available.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id}>
              <h3>
                {review.user?.username || "Unknown User"} on {review.stadium?.name || "Unknown Stadium"}:
              </h3>
              <p>
                {review.comment} (Rating: {review.rating}/10)
                <button onClick={() => deleteReview(review.id)}> Delete Review </button>
              </p>
              <h4>Replies:</h4>
              <ul>
                {review.comments && review.comments.length > 0 ? (
                  review.comments.map((comment) => (
                    <li key={comment.id}>
                      {comment.user?.username || "Unknown User"}: {comment.content}
                      <button onClick={() => deleteComment(comment.id)}> Delete Reply </button>
                    </li>
                  ))
                ) : (
                  <li>No replies on this review.</li>
                )}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Admin;
