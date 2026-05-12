import { Routes, Route } from 'react-router';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Library from '@/pages/Library';
import Paths from '@/pages/Paths';
import PathDetail from '@/pages/PathDetail';
import Feed from '@/pages/Feed';
import Works from '@/pages/Works';
import Journal from '@/pages/Journal';
import Timeline from '@/pages/Timeline';
import About from '@/pages/About';
import ContentDetail from '@/pages/ContentDetail';

export default function App() {
  return (
    <Layout>
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
        <Route path="/content/:id" element={<ContentDetail />} />
      </Routes>
    </Layout>
  );
}
