import { useState, useEffect, useCallback } from 'react';

function Dashboard({ user, onLogout, initialService }) {
  const isProvider = user.role === 'provider';
  console.log('Dashboard user:', user);
  console.log('Provider ID:', user?._id);
  const token = localStorage.getItem('skilllinkToken');
  const [selectedImage, setSelectedImage] = useState(null);
  const [homepageService, setHomepageService] = useState(initialService || null);
  

  // Service publishing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Services
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Customer requests
  const [requestMessage, setRequestMessage] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState('');

  // Provider job requests
  const [jobRequests, setJobRequests] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [updatingRequest, setUpdatingRequest] = useState('');
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    profilePicture: ''
});

const [loadingProfile, setLoadingProfile] = useState(false);
const [savingProfile, setSavingProfile] = useState(false);
const [profileMessage, setProfileMessage] = useState('');
const [serviceSearch, setServiceSearch] = useState('');
const [selectedCategory, setSelectedCategory] = useState('');
const [maxPrice, setMaxPrice] = useState('');
const [sortOrder, setSortOrder] = useState('');
const [selectedService, setSelectedService] = useState(null);
const [reviewRatings, setReviewRatings] = useState({});
const [reviewComments, setReviewComments] = useState({});
const [submittingReview, setSubmittingReview] = useState(null);
const [providerReviews, setProviderReviews] = useState([]);
const [notifications, setNotifications] = useState([]);
const [loadingNotifications, setLoadingNotifications] = useState(false);
const [loadingReviews, setLoadingReviews] = useState(false);
// Messaging
const [activeConversation, setActiveConversation] = useState(null);
const [conversationMessages, setConversationMessages] = useState([]);
const [newMessage, setNewMessage] = useState('');
const [sendingMessage, setSendingMessage] = useState(false);
const [loadingMessages, setLoadingMessages] = useState(false);
const [messageError, setMessageError] = useState(''); 

  const pendingCount = jobRequests.filter(
    (request) => request.status === 'pending'
  ).length;
  const filteredServices = services.filter((service) => {
    const searchTerm = serviceSearch.toLowerCase();

    const matchesSearch =
        service.title.toLowerCase().includes(searchTerm) ||
        service.description.toLowerCase().includes(searchTerm) ||
        service.category.toLowerCase().includes(searchTerm);

    const matchesCategory =
        selectedCategory === '' ||
        service.category === selectedCategory;

    const matchesPrice =
        maxPrice === '' ||
        Number(service.price) <= Number(maxPrice);

    return matchesSearch && matchesCategory && matchesPrice;
});
const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortOrder === 'low-to-high') {
        return Number(a.price) - Number(b.price);
    }

    if (sortOrder === 'high-to-low') {
        return Number(b.price) - Number(a.price);
    }

    return 0;
});

  // Fetch customer requests
  const fetchMyRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);

      const response = await fetch(
        'https://skilllink-w4n4.onrender.com/api/requests/my-requests',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      console.log('Customer requests response status:', response.status);
      console.log('Customer requests response data:', data);
      if (!response.ok) {
        throw new Error(data.message);
      }

      setMyRequests(data);
    } catch (error) {
      console.error('Error fetching customer requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  }, [token]);

    const openConversation = async (request) => {
      console.log('Opening conversation for request:', request);
  setActiveConversation(request);
  setConversationMessages([]);
  setMessageError('');
  setLoadingMessages(true);

  try {
    const response = await fetch(
      `https://skilllink-w4n4.onrender.com/api/messages/${request._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load messages');
    }

    setConversationMessages(data.messages || data);

    await fetch(
      `https://skilllink-w4n4.onrender.com/api/messages/${request._id}/read`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (error) {
    setMessageError(error.message);
  } finally {
    setLoadingMessages(false);
  }
};

  const sendMessage = async (e) => {
  e.preventDefault();

  if (!newMessage.trim() || !activeConversation) return;

  setSendingMessage(true);
  setMessageError('');

  try {
    const response = await fetch(
      `https://skilllink-w4n4.onrender.com/api/messages/${activeConversation._id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage.trim()
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send message');
    }

    setConversationMessages(prev => [...prev, data]);
    setNewMessage('');

  } catch (error) {
    setMessageError(error.message);
  } finally {
    setSendingMessage(false);
  }
};

  // Dashboard statistics
const myPublishedServices = services.filter(
    (service) => service.provider?._id === user._id
);

const totalServices = isProvider
    ? myPublishedServices.length
    : services.length;

const totalRequests = myRequests.length;

const pendingCustomerRequests = myRequests.filter(
    (request) => request.status === 'pending'
).length;

const acceptedCustomerRequests = myRequests.filter(
    (request) => request.status === 'accepted'
).length;

const acceptedJobs = jobRequests.filter(
    (request) => request.status === 'accepted'
).length;

  // Fetch provider job requests
  const fetchJobRequests = useCallback(async () => {
    try {
      setLoadingJobs(true);

      const response = await fetch(
        'https://skilllink-w4n4.onrender.com/api/requests/job-requests',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setJobRequests(data);
    } catch (error) {
      console.error('Error fetching job requests:', error);
    } finally {
      setLoadingJobs(false);
    }
  }, [token]);

  // Fetch provider reviews
  const fetchProviderReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      const providerId = user?._id || user?.id;

      console.log('Fetching reviews for provider:', providerId);

      const response = await fetch(
        `https://skilllink-w4n4.onrender.com/api/reviews/provider/${providerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      console.log('Provider reviews response status:', response.status);
      console.log('Provider reviews response data:', data);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reviews');
      }

      setProviderReviews(data);
    } catch (error) {
      console.error('Review fetching error:', error);
    } finally {
      setLoadingReviews(false);
    }
  }, [token, user.id]);

  const fetchNotifications = useCallback(async () => {
    try {
        setLoadingNotifications(true);

        const response = await fetch(
            'https://skilllink-w4n4.onrender.com/api/notifications',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();
        console.log('Notification response status:', response.status);
        console.log('Notification response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch notifications');
        }

        setNotifications(data);
    } catch (error) {
        console.error('Notification fetching error:', error);
    } finally {
        setLoadingNotifications(false);
    }
}, [token]);
const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await fetch(
            `https://skilllink-w4n4.onrender.com/api/notifications/${notificationId}/read`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }

        setNotifications(prev =>
            prev.map(notification =>
                notification._id === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            )
        );

    } catch (error) {
        console.error('Mark as read error:', error);
    }
};
const markAllNotificationsAsRead = async () => {
    try {
        const response = await fetch(
            'https://skilllink-w4n4.onrender.com/api/notifications/read-all',
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to mark all notifications as read');
        }

        setNotifications(prev =>
            prev.map(notification => ({
                ...notification,
                isRead: true
            }))
        );

    } catch (error) {
        console.error('Mark all as read error:', error);
    }
};

useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
        fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
}, [fetchNotifications]);

  // Fetch provider profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);

      const response = await fetch('https://skilllink-w4n4.onrender.com/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Profile response status:', response.status);
      console.log('Profile response data:', data);

      if (!response.ok) {
        throw new Error(data.message);
      }

      setProfile({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        profilePicture: data.profilePicture || ''
      });
    } catch (error) {
      setProfileMessage(error.message || 'Failed to fetch profile.');
    } finally {
      setLoadingProfile(false);
    }
  }, [token]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
        setSavingProfile(true);
        setProfileMessage('');

        const formData = new FormData();

        formData.append('fullName', profile.fullName);
        formData.append('phone', profile.phone);
        formData.append('location', profile.location);
        formData.append('bio', profile.bio);

        if (selectedImage) {
            formData.append('profilePicture', selectedImage);
        }

        const response = await fetch(
            'https://skilllink-w4n4.onrender.com/api/profile',
            {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${token}`
                },
                body: formData
            }
        );

        const data = await response.json();
        console.log('Profile response status:', response.status);
console.log('Profile response data:', data);

        if (!response.ok) {
            throw new Error(data.message);
        }

        setProfile(data.user);
        setSelectedImage(null);
        setProfileMessage('Profile updated successfully!');

    } catch (error) {
        setProfileMessage(error.message);
    } finally {
        setSavingProfile(false);
    }
};

  // Fetch services for customers
  useEffect(() => {

    const fetchServices = async () => {
      try {
        setLoadingServices(true);

        const response = await fetch(
          'https://skilllink-w4n4.onrender.com/api/services'
        );

       const responseText = await response.text();

console.log('Server response:', response.status, responseText);

let data;

try {
    data = JSON.parse(responseText);
} catch {
    throw new Error(
        `Server returned an unexpected response. Status: ${response.status}. Check the browser console.`
    );
}

if (!response.ok) {
    throw new Error(data.message || 'Profile update failed');
}

        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [user.role]);

  // Automatically refresh customer requests
  useEffect(() => {
    if (user.role !== 'customer') return;

    fetchMyRequests();

    const interval = setInterval(fetchMyRequests, 10000);

    return () => clearInterval(interval);
  }, [user.role, fetchMyRequests]);

  // Automatically refresh provider requests
  useEffect(() => {
    if (user.role !== 'provider') return;

    fetchJobRequests();
    fetchProfile();
    fetchProviderReviews();

    const interval = setInterval(() => {
      fetchJobRequests();
      fetchProfile();
      fetchProviderReviews();
    }, 10000);

    return () => clearInterval(interval);
  }, [user.role, fetchJobRequests, fetchProfile]);

  // Publish a service
  const handlePublishService = async (e) => {
    e.preventDefault();

    try {
      setPublishing(true);
      setMessage('');

      const response = await fetch(
        'https://skilllink-w4n4.onrender.com/api/services',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            description,
            category,
            price: Number(price)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage('Service published successfully!');
      setTitle('');
      setDescription('');
      setCategory('');
      setPrice('');
    } catch (error) {
      setMessage(error.message || 'Failed to publish service.');
    } finally {
      setPublishing(false);
    }
  };

  // Customer submits a service request
  const handleRequestService = async (serviceId) => {
    try {
      setSubmittingRequest(serviceId);
      setRequestStatus('');

      const response = await fetch(
        'https://skilllink-w4n4.onrender.com/api/requests',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            serviceId,
            message: requestMessage
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setRequestStatus('Service request submitted successfully!');
      setRequestMessage('');

      await fetchMyRequests();
      setHomepageService(null);
    } catch (error) {
      setRequestStatus(error.message || 'Failed to submit request.');
    } finally {
      setSubmittingRequest('');
    }
  };


  const handleSubmitReview = async (requestId) => {
    try {
        const rating = reviewRatings[requestId];
        const comment = reviewComments[requestId] || '';

        if (!rating) {
            alert('Please select a rating.');
            return;
        }

        setSubmittingReview(requestId);

        const response = await fetch('https://skilllink-w4n4.onrender.com/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('skilllinkToken')}`
            },
            body: JSON.stringify({
                requestId,
                rating,
                comment
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit review');
        }

        alert('Review submitted successfully!');

        setReviewRatings((prev) => ({
            ...prev,
            [requestId]: ''
        }));

        setReviewComments((prev) => ({
            ...prev,
            [requestId]: ''
        }));

    } catch (error) {
        alert(error.message);
    } finally {
        setSubmittingReview(null);
    }
};

  // Provider accepts or rejects a request
  const handleUpdateRequest = async (requestId, status) => {
    try {
      setUpdatingRequest(requestId);

      const response = await fetch(
        `https://skilllink-w4n4.onrender.com/api/requests/${requestId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      // Update the request immediately
      setJobRequests((previousRequests) =>
        previousRequests.map((request) =>
          request._id === requestId
            ? { ...request, status }
            : request
        )
      );
    } catch (error) {
      alert(error.message || 'Failed to update request.');
    } finally {
      setUpdatingRequest('');
    }
  };
  useEffect(() => {
    fetchProfile();
}, []);

  return (
    <div className="dashboard">

      {/* Navigation */}
      <nav className="dashboard-nav">
        <h2 className="logo">
          Skill<span>Link.</span>
        </h2>

        <button onClick={onLogout}>
          Logout
        </button>
      </nav>

      <main className="dashboard-content">

        <p className="dashboard-label">
          {isProvider ? 'SERVICE PROVIDER' : 'CUSTOMER'}
        </p>

       <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px'
}}>
    {profile.profilePicture && (
        <img
            src={profile.profilePicture}
            alt="Profile"
            style={{
                width: '65px',
                height: '65px',
                borderRadius: '50%',
                objectFit: 'cover'
            }}
        />
    )}

    <h2>Welcome, {profile.fullName || user.fullName}!</h2>

</div>
      {/* Notifications */}
<div className="dashboard-card notification-section">
    <h3>
        Notifications
        {notifications.filter(n => !n.isRead).length > 0 && (
            <span style={{
                marginLeft: '10px',
                background: '#e53935',
                color: 'white',
                borderRadius: '50%',
                padding: '3px 8px',
                fontSize: '12px'
            }}>
                {notifications.filter(n => !n.isRead).length}
            </span>
        )}
    </h3>
    <p>Unread notifications: {notifications.filter(n => !n.isRead).length}</p>
    {notifications.some(n => !n.isRead) && (
    <button onClick={markAllNotificationsAsRead}>
        Mark All as Read
    </button>
)}

    {loadingNotifications ? (
        <p>Loading notifications...</p>
    ) : notifications.length === 0 ? (
        <p>You have no notifications yet.</p>
    ) : (
        notifications.map(notification => (
            <div
                className="notification-card"
                key={notification._id}
                style={{
                    padding: '15px',
                    marginBottom: '12px',
                    borderRadius: '8px',
                    background: notification.isRead ? '#f5f5f5' : '#eaf3ff',
                    borderLeft: notification.isRead
                        ? '4px solid #ccc'
                        : '4px solid #2878d0'
                }}
            >
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>

                <small>
                    {new Date(notification.createdAt).toLocaleString()}
                </small>

               {!notification.isRead && (
    <button
        onClick={() => markNotificationAsRead(notification._id)}
        style={{ marginTop: '8px' }}
    >
        Mark as Read
    </button>
)}
            </div>
        ))
    )}
</div> 


        <p>
          {isProvider
            ? 'Manage your services and grow your business with SkillLink.'
            : 'Discover skilled professionals and get your projects done.'}
        </p>
        {/* DASHBOARD STATISTICS */}
<div className="dashboard-stats">

  {isProvider ? (
    <>
      <div className="dashboard-stat-card">
        <h3>{totalServices}</h3>
        <p>Published Services</p>
      </div>

      <div className="dashboard-stat-card">
        <h3>{pendingCount}</h3>
        <p>Pending Requests</p>
      </div>

      <div className="dashboard-stat-card">
        <h3>{acceptedJobs}</h3>
        <p>Accepted Jobs</p>
      </div>
    </>
  ) : (
    <>
      <div className="dashboard-stat-card">
        <h3>{totalRequests}</h3>
        <p>Total Requests</p>
      </div>

      <div className="dashboard-stat-card">
        <h3>{pendingCustomerRequests}</h3>
        <p>Pending Requests</p>
      </div>

      <div className="dashboard-stat-card">
        <h3>{acceptedCustomerRequests}</h3>
        <p>Accepted Requests</p>
      </div>
    </>
  )}

</div>

        {/* PROVIDER DASHBOARD */}
        {isProvider ? (

          <div className="dashboard-grid">

            {/* Publish Service */}
            <div className="dashboard-card">
              <h3>Publish a Service</h3>
              <p>Tell customers about the services you offer.</p>

              <form onSubmit={handlePublishService}>

                <input
                  type="text"
                  placeholder="Service title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <textarea
                  placeholder="Describe your service"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                <input
                  type="text"
                  placeholder="Category (e.g. Plumbing)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />

                <input
                  type="number"
                  placeholder="Price (GHS)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  required
                />

                <button type="submit" disabled={publishing}>
                  {publishing ? 'Publishing...' : 'Publish Service'}
                </button>

                {message && <p>{message}</p>}

              </form>
            </div>

            {/* Job Requests */}
            <div className="dashboard-card">
              <h3>
                Job Requests
                {pendingCount > 0 && (
                  <span className="notification-count">
                    {pendingCount}
                  </span>
                )}
              </h3>

              <p>
                You have {pendingCount} pending request
                {pendingCount === 1 ? '' : 's'}.
              </p>

              {loadingJobs && jobRequests.length === 0 ? (
                <p>Loading job requests...</p>
              ) : jobRequests.length === 0 ? (
                <p>You have no job requests yet.</p>
              ) : (

                jobRequests.map((request) => (

                  <div className="request-item" key={request._id}>

                    <h4>
                      {request.service?.title || 'Service'}
                    </h4>

                    <p>
                      Customer: {request.customer?.fullName || 'Unknown'}
                    </p>

                    <p>
                      Message: {request.message || 'No message provided'}
                    </p>

                    <p>
                      Status:{' '}
                      <span className={`status-badge ${request.status}`}>
                        {request.status}
                      </span>
                    </p>
                    <button
  type="button"
  onClick={() => openConversation(request)}
>
  Message Customer
</button>

                    {request.status === 'pending' && (
                      <div className="request-actions">

                        <button
                          disabled={updatingRequest === request._id}
                          onClick={() =>
                            handleUpdateRequest(request._id, 'accepted')
                          }
                        >
                          {updatingRequest === request._id
                            ? 'Updating...'
                            : 'Accept'}
                        </button>

                        <button
                          disabled={updatingRequest === request._id}
                          onClick={() =>
                            handleUpdateRequest(request._id, 'rejected')
                          }
                        >
                          Reject
                        </button>

                      </div>
                    )}
                    {request.status === 'accepted' && (
    <div className="request-actions">
        <button
            disabled={updatingRequest === request._id}
            onClick={() =>
                handleUpdateRequest(request._id, 'completed')
            }
        >
            {updatingRequest === request._id
                ? 'Updating...'
                : 'Mark as Completed'}
        </button>
    </div>
)}

                  </div>

                ))
              )}

            </div>

                {/* Customer Reviews */}
<div className="dashboard-card">
    <h3>Customer Reviews</h3>

    {loadingReviews ? (
        <p>Loading reviews...</p>
    ) : providerReviews.length === 0 ? (
        <p>You haven't received any reviews yet.</p>
    ) : (
        providerReviews.map((review) => (
            <div className="review-card" key={review._id}>
                <h4>{review.customer?.fullName || 'Anonymous'}</h4>
                <p>Service: {review.service?.title || 'Service'}</p>
                <p>Rating: {'⭐'.repeat(review.rating)}</p>
                <p>{review.comment || 'No written comment'}</p>
                <small>
                    {new Date(review.createdAt).toLocaleDateString()}
                </small>
            </div>
        ))
    )}
</div>

            {/* Customer Reviews */}
<div className="dashboard-card">
    <h3>Customer Reviews</h3>

    {loadingReviews ? (
        <p>Loading reviews...</p>
    ) : providerReviews.length === 0 ? (
        <p>You haven't received any reviews yet.</p>
    ) : (
        providerReviews.map((review) => (
            <div className="review-card" key={review._id}>

                <h4>
                    {review.customer?.fullName || 'Anonymous'}
                </h4>

                <p>
                    Service: {review.service?.title || 'Service'}
                </p>

                <p>
                    Rating: {'⭐'.repeat(review.rating)}
                </p>

                <p>
                    {review.comment || 'No written comment'}
                </p>

                <small>
                    {new Date(review.createdAt).toLocaleDateString()}
                </small>

            </div>
        ))
    )}
</div>

           <div className="dashboard-card">







    <h3>My Profile</h3>

    {loadingProfile ? (
        <p>Loading profile...</p>
    ) : (
        <form onSubmit={handleSaveProfile}>

            {profile.profilePicture && (
                <img
                    src={profile.profilePicture}
                    alt="Profile"
                    style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginBottom: '15px'
                    }}
                />
            )}

            <input
                type="text"
                placeholder="Full Name"
                value={profile.fullName}
                onChange={(e) =>
                    setProfile({
                        ...profile,
                        fullName: e.target.value
                    })
                }
                required
            />

            <input
                type="email"
                value={profile.email}
                disabled
            />

            <input
                type="text"
                placeholder="Phone Number"
                value={profile.phone}
                onChange={(e) =>
                    setProfile({
                        ...profile,
                        phone: e.target.value
                    })
                }
            />

            <input
                type="text"
                placeholder="Your Location"
                value={profile.location}
                onChange={(e) =>
                    setProfile({
                        ...profile,
                        location: e.target.value
                    })
                }
            />

           <input
    type="file"
    accept="image/png, image/jpeg, image/webp"
    onChange={(e) => {
        const file = e.target.files[0];

        if (file && file.size > 2 * 1024 * 1024) {
            alert('Image must not exceed 2MB.');
            e.target.value = '';
            return;
        }

        setSelectedImage(file || null);
    }}
/>

            {isProvider && (
                <textarea
                    placeholder="Tell customers about your professional experience..."
                    value={profile.bio}
                    onChange={(e) =>
                        setProfile({
                            ...profile,
                            bio: e.target.value
                        })
                    }
                />
            )}

            <button type="submit" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>

            {profileMessage && (
                <p>{profileMessage}</p>
            )}

        </form>
    )}
</div>
          </div>

        ) : (








          /* CUSTOMER DASHBOARD */
          <div className="dashboard-grid">

            {/* Explore Services */}
            <div className="dashboard-card">
              <h3>Explore Services</h3>
              <p>Find professionals for your needs.</p>

              <div className="service-filters">

    <input
        type="text"
        placeholder="Search services..."
        value={serviceSearch}
        onChange={(e) => setServiceSearch(e.target.value)}
    />

    <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
    >
        <option value="">All Categories</option>

        {[...new Set(services.map((service) => service.category))].map(
            (category) => (
                <option key={category} value={category}>
                    {category}
                </option>
            )
        )}
    </select>

    <input
        type="number"
        placeholder="Maximum price (GHS)"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
    />
    <select
    value={sortOrder}
    onChange={(e) => setSortOrder(e.target.value)}
>
    <option value="">Default Sorting</option>
    <option value="low-to-high">Price: Low to High</option>
    <option value="high-to-low">Price: High to Low</option>
</select>

</div>
{homepageService && user.role === 'customer' && (
  <div className="selected-home-service">
    <p>YOU SELECTED THIS SERVICE ON SKILLLINK</p>

    <h3>{homepageService.title}</h3>
    <p>{homepageService.description}</p>
    <p>{homepageService.category}</p>
    <p>
      Price: GHS {Number(homepageService.price).toLocaleString()}
    </p>

    <textarea
      placeholder="Describe what you need (optional)"
      value={requestMessage}
      onChange={(e) => setRequestMessage(e.target.value)}
    />

    <button
      className="request-btn"
      disabled={submittingRequest === homepageService._id}
      onClick={() => handleRequestService(homepageService._id)}
    >
      {submittingRequest === homepageService._id
        ? 'Submitting...'
        : 'Request This Selected Service'}
    </button>
  </div>
)}

              {loadingServices ? (
                <p>Loading services...</p>
              ) : services.length === 0 ? (
                <p>No services available yet.</p>
              ) : (

                sortedServices.map((service) => (

                  <div className="service-item" key={service._id}>

                    <h4>{service.title}</h4>

                    <p>{service.description}</p>

                    <span className="service-category">
                      {service.category}
                    </span>

                    <p className="service-price">
                      GHS {Number(service.price).toLocaleString()}
                    </p>
                    <button
                      className="request-btn"
                      onClick={() => setSelectedService(service)}
>
                      View Details
                  </button>

                    <div className="service-provider">

                      <div className="provider-avatar">
                        {service.provider?.fullName
                          ?.charAt(0).toUpperCase() || '?'}
                      </div>

                      <div>
                        <small>Provided by</small>
                        <p>
                          {service.provider?.fullName || 'Unknown'}
                        </p>
                      </div>

                    </div>

                    <textarea
                      placeholder="Describe what you need (optional)"
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                    />

                    <button
                      className="request-btn"
                      disabled={submittingRequest === service._id}
                      onClick={() => handleRequestService(service._id)}
                    >
                      {submittingRequest === service._id
                        ? 'Submitting...'
                        : 'Request Service'}
                    </button>

                    {requestStatus && (
                      <p>{requestStatus}</p>
                    )}

                  </div>

                ))
              )}

            </div>

            {/* My Requests */}
            <div className="dashboard-card">
              <h3>My Requests</h3>

              {loadingRequests && myRequests.length === 0 ? (
                <p>Loading your requests...</p>
              ) : myRequests.length === 0 ? (
                <p>You haven't made any requests yet.</p>
              ) : (

                myRequests.map((request) => (

                  <div className="request-item" key={request._id}>

                    <h4>
                      {request.service?.title || 'Service'}
                    </h4>

                    <p>
                      Provider: {request.provider?.fullName || 'Unknown'}
                    </p>

                    <p>
                      Message: {request.message || 'No message provided'}
                    </p>

                    <p>
                      Status:{' '}
                      <span className={`status-badge ${request.status}`}>
                        {request.status}
                      </span>
                    </p>

                    <button
  type="button"
  onClick={() => {
    console.log('Customer request:', request);
    openConversation(request);
  }}
>
  Message Provider
</button>
    {request.status === 'completed' && (
    <div className="review-form">

        <h4>Rate this Provider</h4>

        <select
            value={reviewRatings[request._id] || ''}
            onChange={(e) =>
                setReviewRatings((prev) => ({
                    ...prev,
                    [request._id]: e.target.value
                }))
            }
        >
            <option value="">Select a rating</option>
            <option value="1">⭐ 1 - Poor</option>
            <option value="2">⭐⭐ 2 - Fair</option>
            <option value="3">⭐⭐⭐ 3 - Good</option>
            <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
        </select>

        <textarea
            placeholder="Write your review..."
            value={reviewComments[request._id] || ''}
            onChange={(e) =>
                setReviewComments((prev) => ({
                    ...prev,
                    [request._id]: e.target.value
                }))
            }
        />

        <button
            disabled={submittingReview === request._id}
            onClick={() => handleSubmitReview(request._id)}
        >
            {submittingReview === request._id
                ? 'Submitting...'
                : 'Submit Review'}
        </button>

    </div>
)}

                  </div>

                ))
              )}

            </div>

            {/* Customer Profile */}
            <div className="dashboard-card">
    <h3>My Profile</h3>

    {loadingProfile ? (
        <p>Loading profile...</p>
    ) : (
        <form onSubmit={handleSaveProfile}>

            {profile.profilePicture && (
                <img
                    src={profile.profilePicture}
                    alt="Profile"
                    style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginBottom: '15px'
                    }}
                />
            )}

            <input
                type="text"
                placeholder="Full Name"
                value={profile.fullName}
                onChange={(e) =>
                    setProfile({
                        ...profile,
                        fullName: e.target.value
                    })
                }
                required
            />

            <input
                type="email"
                value={profile.email}
                disabled
            />

            <input
                type="text"
                placeholder="Phone Number"
                value={profile.phone}
                onChange={(e) =>
                    setProfile({
                        ...profile,
                        phone: e.target.value
                    })
                }
            />

            <input
                type="text"
                placeholder="Your Location"
                value={profile.location}
                onChange={(e) =>
                    setProfile({
                        ...profile,
                        location: e.target.value
                    })
                }
            />

            <input
    type="file"
    accept="image/png, image/jpeg, image/webp"
    onChange={(e) => {
        const file = e.target.files[0];

        if (file && file.size > 2 * 1024 * 1024) {
            alert('Image must not exceed 2MB.');
            e.target.value = '';
            return;
        }

        setSelectedImage(file || null);
    }}
/>

            {isProvider && (
                <textarea
                    placeholder="Tell customers about your professional experience..."
                    value={profile.bio}
                    onChange={(e) =>
                        setProfile({
                            ...profile,
                            bio: e.target.value
                        })
                    }
                />
            )}

            <button type="submit" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>

            {profileMessage && (
                <p>{profileMessage}</p>
            )}

        </form>
    )}
</div>

          </div>
        )}

      </main>

      {activeConversation && (
  <div className="dashboard-card chat-panel">

    <h3>
      Chat - {activeConversation.service?.title || 'Service Request'}
    </h3>

    <p>
      {isProvider
        ? `Customer: ${activeConversation.customer?.fullName || 'Customer'}`
        : `Provider: ${activeConversation.provider?.fullName || 'Provider'}`}
    </p>

    <button
      type="button"
      onClick={() => setActiveConversation(null)}
    >
      Close Chat
    </button>

    {messageError && <p>{messageError}</p>}

    <div className="chat-messages">

      {loadingMessages ? (
        <p>Loading messages...</p>
      ) : conversationMessages.length === 0 ? (
        <p>No messages yet. Start the conversation!</p>
      ) : (
        conversationMessages.map((message) => (
          <div
            key={message._id}
            className={
              message.sender?._id === user._id
                ? 'chat-message own-message'
                : 'chat-message'
            }
          >
            <p>{message.content}</p>
            <small>
              {message.sender?.fullName || 'User'}
            </small>
          </div>
        ))
      )}

    </div>

    <form onSubmit={sendMessage}>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      />

      <button
        type="submit"
        disabled={sendingMessage || !newMessage.trim()}
      >
        {sendingMessage ? 'Sending...' : 'Send'}
      </button>
    </form>

  </div>
)}
      {selectedService && (
    <div className="service-modal-overlay">

        <div className="service-modal">

            <button
                className="close-modal"
                onClick={() => setSelectedService(null)}
            >
                ×
            </button>

            <h2>{selectedService.title}</h2>

            <p>{selectedService.description}</p>

            <p>
                <strong>Category:</strong> {selectedService.category}
            </p>

            <p>
                <strong>Price:</strong> GHS {Number(selectedService.price).toLocaleString()}
            </p>

            <p>
                <strong>Provider:</strong> {selectedService.provider?.fullName || 'Unknown'}
            </p>
            <button
    className="request-btn"
    disabled={submittingRequest === selectedService._id}
    onClick={() => handleRequestService(selectedService._id)}
>
    {submittingRequest === selectedService._id
        ? 'Submitting...'
        : 'Request This Service'}
</button>

        </div>

    </div>
)}
    </div>
  );
}

export default Dashboard;