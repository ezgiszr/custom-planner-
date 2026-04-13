import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Plus, LayoutTemplate, Flower2 } from "lucide-react";
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

export default function Dashboard() {
  const [layout, setLayout] = useLocalStorage("dashboard_layout", []);
  const [widgets, setWidgets] = useLocalStorage("dashboard_widgets", []);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7fb_0%,#ffeaf4_35%,#ffe2ef_70%,#fff4f8_100%)] p-6 md:p-8">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-8 top-10 text-pink-200"><Flower2 className="h-16 w-16" /></div>
        <div className="absolute right-12 top-24 text-rose-200"><Flower2 className="h-12 w-12" /></div>
        <div className="absolute bottom-16 left-16 text-pink-100"><Flower2 className="h-20 w-20" /></div>
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-rose-700">
              <LayoutTemplate className="h-8 w-8" />
              Soft Bloom Dashboard
            </h1>
            <p className="text-rose-500 mt-1">Widget seç, sürükle, kendi alanını oluştur</p>
          </div>

          <div className="relative">
            <Button 
              onClick={() => setShowDropdown(!showDropdown)}
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
                    className="w-full text-left px-4 py-3 text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors border-b border-rose-50/50 last:border-0"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
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
