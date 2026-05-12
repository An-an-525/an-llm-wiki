import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { HomePage } from "@/pages/HomePage";
import { LibraryPage } from "@/pages/LibraryPage";
import { LibraryDetailPage } from "@/pages/LibraryDetailPage";
import { PathsPage } from "@/pages/PathsPage";
import { PathDetailPage } from "@/pages/PathDetailPage";
import { FeedPage } from "@/pages/FeedPage";
import { WorksPage } from "@/pages/WorksPage";
import { JournalPage } from "@/pages/JournalPage";
import { JournalDetailPage } from "@/pages/JournalDetailPage";
import { TimelinePage } from "@/pages/TimelinePage";
import { AboutPage } from "@/pages/AboutPage";
import { ContentDetailPage } from "@/pages/ContentDetailPage";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

function AnimatedOutlet() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:id" element={<LibraryDetailPage />} />
          <Route path="/paths" element={<PathsPage />} />
          <Route path="/paths/:id" element={<PathDetailPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:id" element={<JournalDetailPage />} />
          <Route path="/content/:slug" element={<ContentDetailPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Shell />}>
          <Route path="*" element={<AnimatedOutlet />} />
        </Route>
      </Routes>
    </>
  );
}
