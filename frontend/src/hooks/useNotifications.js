import { useEffect } from 'react';
import api from '../api/axios';

export const useNotifications = () => {
    useEffect(() => {
        const activeBookingId = localStorage.getItem('active_booking_id');
        if (!activeBookingId) return;

        const checkAndNotify = async () => {
            try {
                // To avoid multiple notifications for the same booking ID at the same time
                const lastNotifiedKey = `last_notified_${activeBookingId}`;
                const lastNotified = localStorage.getItem(lastNotifiedKey);
                
                const res = await api.get('/reservations/');
                const all = res.data.results || res.data;
                const booking = all.find(b => b.booking_id === activeBookingId);

                if (booking && booking.status === 'menunggu') {
                    const scheduledTime = new Date(booking.scheduled_time);
                    const now = new Date();
                    const diffMs = scheduledTime - now;
                    const diffMins = Math.floor(diffMs / 60000);

                    // If it's roughly 15 minutes before (e.g., between 14 and 16 mins)
                    if (diffMins === 15 && lastNotified !== '15') {
                        if (Notification.permission === 'granted') {
                            new Notification("Pengingat Javas Barber Connect", {
                                body: `Halo ${booking.customer_name}, reservasi kamu akan dimulai 15 menit lagi (${booking.scheduled_time.substring(11, 16)} WIB). Yuk siap-siap!`,
                                icon: '/logo.png'
                            });
                            localStorage.setItem(lastNotifiedKey, '15');
                        }
                    }
                }
            } catch (err) {
                console.error("Notification check failed:", err);
            }
        };

        const interval = setInterval(checkAndNotify, 60000); // Check every minute
        checkAndNotify();

        return () => clearInterval(interval);
    }, []);
};
