import { BrowserRouter, Route, Routes } from 'react-router'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { ScrollToTop } from './components/ScrollToTop'
import { FavoritesPage } from './pages/FavoritesPage'
import { Home } from './pages/Home'
import { ModulePage } from './pages/ModulePage'
import { NotFound } from './pages/NotFound'
import { SearchPage } from './pages/SearchPage'
import { TemplatesPage } from './pages/TemplatesPage'

export default function App() {
  return (
    // ErrorBoundary 放在最外层：任何路由内的渲染异常都会兜住，
    // 而不是让 React 卸载整棵树变成白屏。
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="module/:id" element={<ModulePage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
