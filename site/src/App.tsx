import { Routes, Route } from 'react-router';
import { lazy, Suspense } from 'react';
import Layout from '@/components/Layout';
import { PageSkeleton } from '@/components/ui/lifecycle';

const Home = lazy(() => import('@/pages/Home'));
const Library = lazy(() => import('@/pages/Library'));
const Paths = lazy(() => import('@/pages/Paths'));
const PathDetail = lazy(() => import('@/pages/PathDetail'));
const Feed = lazy(() => import('@/pages/Feed'));
const Works = lazy(() => import('@/pages/Works'));
const Journal = lazy(() => import('@/pages/Journal'));
const Timeline = lazy(() => import('@/pages/Timeline'));
const About = lazy(() => import('@/pages/About'));
const ContentDetail = lazy(() => import('@/pages/ContentDetail'));
const Install = lazy(() => import('@/pages/Install'));
const Xiaoan = lazy(() => import('@/pages/Xiaoan'));

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="pt-24 px-5 md:px-12"><PageSkeleton type="cards" count={6} /></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/paths" element={<Paths />} />
          <Route path="/paths/:id" element={<PathDetail />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/works" element={<Works />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/about" element={<About />} />
          <Route path="/xiaoan" element={<Xiaoan />} />
          <Route path="/install" element={<Install />} />
          <Route path="/content/:id" element={<ContentDetail />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
