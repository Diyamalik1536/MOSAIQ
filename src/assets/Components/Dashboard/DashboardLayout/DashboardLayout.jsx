
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import { useUser } from "../../../../context/UserContext";
import {
    setPosts,
    setPostsLoading,
    setPostsError,
} from "../../../../features/posts/postsSlice";
import { subscribeToPosts } from "../../../../services/postsService";
import { normalizePosts } from "../recommendationUtils";

function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { currentUser } = useUser();
    const dispatch = useDispatch();

    function toggleSidebar() {
        setSidebarOpen((previous) => !previous);
    }

    useEffect(() => {
        if (!currentUser?.uid) {
            dispatch(setPosts([]));
            return;
        }

        let unsubscribe;

        dispatch(setPostsLoading());

        try {
            unsubscribe = subscribeToPosts(
                (firestorePosts) => {
                    dispatch(setPosts(normalizePosts(firestorePosts)));
                },
                (error) => {
                    console.error("Failed to load community posts:", error);
                    dispatch(setPostsError(error.message));
                }
            );
        } catch (error) {
            console.error("Could not subscribe to community posts:", error);
            dispatch(setPostsError(error.message));
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [currentUser?.uid, dispatch]);

    return (
        <div className="dashboard">
            <Header toggleSidebar={toggleSidebar} />

            <div className="dashboard_body">
                <Sidebar sidebarOpen={sidebarOpen} />

                <main className="dashboard_main">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
