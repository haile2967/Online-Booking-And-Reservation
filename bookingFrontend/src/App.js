import React, { useState, useMemo } from 'react';
import { Provider } from 'react-redux';
import './App.css';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { routes, getRouteById, getDefaultRoute, getNavigationItems } from './routes';
import { store } from './store';

function App() {
  const [currentView, setCurrentView] = useState(getDefaultRoute().id);

  const handleNavigate = (routeId) => {
    setCurrentView(routeId);
  };

  const handleBookNow = () => {
    setCurrentView('booking');
  };

  const navigationItems = useMemo(() => getNavigationItems(), []);

  const renderCurrentView = () => {
    const currentRoute = getRouteById(currentView);
    if (!currentRoute) {
      return <div>Page not found</div>;
    }

    const Component = currentRoute.component;
    return <Component onBookNow={handleBookNow} />;
  };

    return (
    <Provider store={store}>
      <div className="App min-h-screen bg-gray-50">
        <Header
          onNavigate={handleNavigate}
          currentView={currentView}
          navigationItems={navigationItems}
        />
        <main className="flex-1">
          {renderCurrentView()}
        </main>
        <Footer />
      </div>
    </Provider>
  );
}

export default App;
