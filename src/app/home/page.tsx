/* eslint-disable */
"use client";
import styles from "./home.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Workflows() {

    const [session, setSession] = useState<{
        userId: string;
        email: string;
        username: string;
        docks?: any;
      } | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
      

    const openSettingsModal = () => setIsSettingsModalOpen(true);
    const closeSettingsModal = () => setIsSettingsModalOpen(false);

    const changeUsername = async () => {
        if (!newUsername) {
            alert('Please enter a new username.');
            return;
        }
        const confirmChange = window.confirm("Are you sure you want to change your username?");
        if (confirmChange) {
            try {
                const response = await fetch("/api/settings/changeUsername", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: session?.userId, newUsername }),
                });
                if (response.ok) {
                    alert("Username changed successfully");
                    setNewUsername('');
                    // Refresh session or handle updates here
                } else {
                    alert("Failed to change username");
                }
            } catch (error) {
                console.error("Error changing username:", error);
            }
        }
    };
    
    const changeEmail = async () => {
        if (!newEmail) {
            alert('Please enter a new email.');
            return;
        }
        const confirmChange = window.confirm("Are you sure you want to change your email?");
        if (confirmChange) {
            try {
                const response = await fetch("/api/settings/changeEmail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: session?.userId, newEmail }),
                });
                if (response.ok) {
                    alert("Email change initiated. Please check your email for verification.");
                    setNewEmail('');
                    // Handle logout or session refresh
                } else {
                    alert("Failed to change email");
                }
            } catch (error) {
                console.error("Error changing email:", error);
            }
        }
    };

    
    const router = useRouter();

    useEffect(() => {
        const fetchSession = async () => {
          try {
            const response = await fetch("/api/auth/session");
            if (response.ok) {
              const data = await response.json();
              setSession(data);
            } else {
              router.push("/login");
            }
          } catch (error) {
            console.error("Error fetching session:", error);
            router.push("/login");
          }
        };

        if (!session) {
          fetchSession();
        }
    
      }, [ router, session]);

    const handleLogout = async () => {
    try {
        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (response.ok) {
        router.push("/login");
        } else {
        console.error("Logout failed");
        }
    } catch (error) {
        console.error("Logout error:", error);
    }
    };

    return (
        <div className={styles.container}>
            <div className={styles.pageFiller}></div>
            <div className={styles.page}>
                <div className={styles.header}>
                    <div className={styles.logoText}>
                        <a href="/">
                        <span className={styles.logospan}>BYTESIZE</span>AI
                        </a>
                    </div>
                    <div className={styles.session}>
                        {session ? (
                            <div className={styles.sessionText}>
                            <p className={styles.username}>Hello, {session.username}!</p>
                            </div>
                        ) : (
                            <p className={styles.sessionText}>Loading...</p>
                        )}
                    </div>
                    <div className={styles.settings}>
                    <button onClick={openSettingsModal} className={styles.settingsButton}>Settings</button>
                        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
                    </div>
                </div>
                <div className={styles.content}></div>
                <div className={styles.footer}></div>

                {/* Settings Modal */}
                {isSettingsModalOpen && (
                    <div className={styles.modalOverlay} onClick={closeSettingsModal}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Settings</h2>
                        <div className={styles.modalContent}>
                            <label>
                            <input
                                type="text"
                                placeholder="Enter new username"
                                className={styles.input}
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                            />
                            <button onClick={changeUsername} className={styles.actionButton}>
                                Change Username
                            </button>
                            </label>
                            <label>
                            
                            </label>
                            <label>
                            
                            <input
                                type="email"
                                placeholder="Enter new email"
                                className={styles.input}
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                            />
                            <button onClick={changeEmail} className={styles.actionButton}>
                            Change Email
                            </button>
                            </label>
                            Forgot your password?
                            <button onClick={() => router.push("/forgot-password")} className={styles.actionButton}>
                            Reset Password
                            </button>
                        </div>
                        <div className={styles.modalFooter}>
                            <button onClick={closeSettingsModal} className={styles.closeButton}>Close</button>
                        </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}