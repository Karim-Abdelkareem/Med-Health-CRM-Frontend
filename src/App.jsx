import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { Provider } from "react-redux";
import store from "./store/store";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <AppRoutes />
            <Toaster />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
