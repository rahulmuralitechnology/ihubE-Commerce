import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { appRoutes } from "./routes/Routes";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {appRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element}>
                {route.children?.map((childRoute, childIndex) => (
                  <Route
                    key={childIndex}
                    index={childRoute.index}
                    path={childRoute.path}
                    element={childRoute.element}
                  />
                ))}
              </Route>
            ))}
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;