import React, { useState, useEffect, useRef } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Plus, LayoutTemplate, Flower2, Palette, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import WidgetRenderer from "./WidgetRenderer";
import { Button } from "@/components/ui/button";

// Add default CSS for react-grid-layout
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_OPTIONS = [
  { type: "todo", label: "Görev Listesi", defaultW: 4, defaultH: 5 },
  { type: "timer", label: "Zamanlayıcı", defaultW: 4, defaultH: 4 },
  { type: "weekly", label: "Haftalık Plan", defaultW: 6, defaultH: 5 },
];

const THEME_COLORS = [
  { id: 'white', color: '#FFFFFF', name: 'White' },
  { id: 'pastel-blue', color: '#D6EAF8', name: 'Pastel Blue' },
  { id: 'pastel-blue-soft', color: '#C5E3FF', name: 'Pastel Blue Light' },
  { id: 'soft-pink-light', color: '#FFE4FB', name: 'Soft Pink Light' },
  { id: 'soft-pink', color: '#FFC8EE', name: 'Soft Pink' },
  { id: 'sage-light', color: '#DEE2B9', name: 'Sage Light' },
  { id: 'sage-medium', color: '#B1CBAC', name: 'Sage Medium' },
  { id: 'sage-dark', color: '#88AE89', name: 'Sage Dark' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [layout, setLayout] = useLocalStorage("dashboard_layout", []);
  const [widgets, setWidgets] = useLocalStorage("dashboard_widgets", []);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [theme, setTheme] = useLocalStorage("dashboard_theme", "soft-pink-light");
  const [isMounted, setIsMounted] = useState(false);
  const colorPickerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addWidget = (option) => {
    const newId = `${option.type}_${Date.now()}`;
    const newWidget = { id: newId, type: option.type };
    
    // Find a somewhat intelligent placement
    const newY = Math.max(0, ...layout.map(l => l.y + l.h), 0);
    
    const newLayoutItem = {
      i: newId,
      x: 0,
      y: newY,
      w: option.defaultW,
      h: option.defaultH,
      minW: 3,
      minH: 3
    };

    setWidgets([...widgets, newWidget]);
    setLayout([...layout, newLayoutItem]);
    setShowDropdown(false);
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
    setLayout(layout.filter(l => l.i !== id));
  };

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  if (!isMounted) return null;

  const currentTheme = THEME_COLORS.find(c => c.id === theme) || THEME_COLORS[0];

  return (
    <div 
      className="min-h-screen p-6 md:p-8 transition-colors duration-500"
      style={{ backgroundColor: currentTheme.color }}
    >
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-8 top-10 text-pink-200"><Flower2 className="h-16 w-16" /></div>
        <div className="absolute right-12 top-24 text-rose-200"><Flower2 className="h-12 w-12" /></div>
        <div className="absolute bottom-16 left-16 text-pink-100"><Flower2 className="h-20 w-20" /></div>
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-primary">
              <LayoutTemplate className="h-8 w-8" />
              Soft Bloom Dashboard
            </h1>
            <p className="text-primary/70 mt-1">Widget seç, sürükle, kendi alanını oluştur</p>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* User info + logout */}
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl px-3 py-1.5">
              {user?.photoURL && (
                <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full" />
              )}
              <span className="text-sm font-medium text-rose-700 hidden sm:block">{user?.displayName?.split(" ")[0]}</span>
              <button onClick={logout} title="Çıkış Yap" className="text-rose-400 hover:text-rose-600 transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
            <div className="relative" ref={colorPickerRef}>
              <Button 
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  setShowDropdown(false);
                }}
                variant="outline"
                className="bg-white/50 backdrop-blur-sm border-white/50 hover:bg-white/80 rounded-xl"
              >
                <Palette className="h-5 w-5" />
              </Button>

              {showColorPicker && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white/90 backdrop-blur-xl border border-rose-100 shadow-xl overflow-hidden z-50 p-2 grid gap-1">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => {
                        setTheme(color.id);
                        setShowColorPicker(false);
                      }}
                      className={`flex items-center gap-3 w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${theme === color.id ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: color.color }} />
                      {color.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={dropdownRef}>
              <Button 
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  setShowColorPicker(false);
                }}
              className="bg-rose-500 hover:bg-rose-600 rounded-full pl-4 pr-5 shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Widget Ekle
            </Button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white/90 backdrop-blur-xl border border-rose-100 shadow-xl overflow-hidden z-50">
                {WIDGET_OPTIONS.map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => addWidget(opt)}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            </div>
          </div>
        </header>

        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-rose-400 border-2 border-dashed border-rose-200 rounded-3xl bg-white/30 backdrop-blur-sm">
            <LayoutTemplate className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-xl font-medium">Henüz dashboard'da widget yok</p>
            <p className="text-sm mt-2 opacity-80">Sağ üstten yeni widget ekleyebilirsin</p>
          </div>
        ) : (
          <ResponsiveGridLayout
            className="layout -mx-2"
            layouts={{ lg: layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={90}
            onLayoutChange={onLayoutChange}
            draggableHandle=".drag-handle"
            isBounded={false}
          >
            {widgets.map(widget => (
              <div key={widget.id} className="p-2">
                <WidgetRenderer 
                  id={widget.id} 
                  type={widget.type}
                  onRemove={removeWidget}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>
    </div>
  );
}
