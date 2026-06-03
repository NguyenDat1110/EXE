import React, { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Star, Line, Group, Transformer, Text, Arc, RegularPolygon } from 'react-konva';
import Konva from 'konva';
import { LayoutGrid } from 'lucide-react';
import { useStageBuilderStore, ItemType, StageItem, generateId } from '../../../store/stageBuilderStore';

// Canvas config
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const GRID_SIZE = 40;

// ─── Grid Background ───
function GridLines() {
  const lines: React.ReactElement[] = [];

  // Vertical
  for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, CANVAS_HEIGHT]}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={1}
      />
    );
  }
  // Horizontal
  for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, CANVAS_WIDTH, y]}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={1}
      />
    );
  }

  return <>{lines}</>;
}

// ─── Individual Item Shapes ───
interface ShapeProps {
  item: StageItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<StageItem>) => void;
}

// ── Shared Transformer wrapper ──
function SelectionTransformer({
  shapeRef,
  isSelected,
  onChange,
  offset,
}: {
  shapeRef: React.RefObject<Konva.Node | null>;
  isSelected: boolean;
  onChange: (updates: Partial<StageItem>) => void;
  offset?: number;
}) {
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, shapeRef]);

  if (!isSelected) return null;

  return (
    <Transformer
      ref={trRef}
      rotateEnabled={true}
      enabledAnchors={[]}
      rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
      rotateAnchorOffset={offset ?? 25}
      borderStroke="#00d4ff"
      borderStrokeWidth={1.5}
      anchorStroke="#00d4ff"
      anchorFill="#0a0f1e"
      anchorSize={8}
      onTransformEnd={() => {
        const node = shapeRef.current;
        if (node) {
          const parent = node.getParent();
          if (parent) {
            onChange({ rotation: parent.rotation() });
          }
        }
      }}
    />
  );
}

// ── Draggable group wrapper ──
function DraggableGroup({
  item,
  onSelect,
  onChange,
  children,
}: {
  item: StageItem;
  onSelect: () => void;
  onChange: (updates: Partial<StageItem>) => void;
  children: React.ReactNode;
}) {
  return (
    <Group
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      draggable
      onDragEnd={(e) => {
        onChange({ x: e.target.x(), y: e.target.y() });
      }}
      onClick={onSelect}
      onTap={onSelect}
    >
      {children}
    </Group>
  );
}

// ═══════════════════════════════════════════════════
//  EXISTING SHAPES
// ═══════════════════════════════════════════════════

function StageShape({ item, isSelected, onSelect, onChange }: ShapeProps) {
  const shapeRef = useRef<Konva.Rect>(null);

  return (
    <>
      <DraggableGroup item={item} onSelect={onSelect} onChange={onChange}>
        <Rect
          ref={shapeRef}
          width={160}
          height={100}
          offsetX={80}
          offsetY={50}
          fill="#3b3b3b"
          cornerRadius={6}
          stroke={isSelected ? '#00d4ff' : 'rgba(255,255,255,0.1)'}
          strokeWidth={isSelected ? 2 : 1}
          shadowColor="rgba(0,0,0,0.4)"
          shadowBlur={12}
          shadowOffsetY={4}
        />
        <Rect
          width={140}
          height={8}
          offsetX={70}
          offsetY={-30}
          fill="#f59e0b"
          cornerRadius={4}
          opacity={0.7}
        />
        <Text
          text="SÂN KHẤU"
          fontSize={11}
          fontStyle="bold"
          fill="rgba(255,255,255,0.7)"
          width={160}
          align="center"
          offsetX={80}
          offsetY={5}
          listening={false}
        />
      </DraggableGroup>
      <SelectionTransformer shapeRef={shapeRef} isSelected={isSelected} onChange={onChange} />
    </>
  );
}

function TableRoundShape({ item, isSelected, onSelect, onChange }: ShapeProps) {
  const shapeRef = useRef<Konva.Circle>(null);

  const chairs: React.ReactElement[] = [];
  const chairCount = 10;
  const tableRadius = 45;
  const chairRadius = 8;
  const orbitRadius = tableRadius + 16;

  for (let i = 0; i < chairCount; i++) {
    const angle = (i / chairCount) * Math.PI * 2 - Math.PI / 2;
    chairs.push(
      <Circle
        key={`chair-${i}`}
        x={Math.cos(angle) * orbitRadius}
        y={Math.sin(angle) * orbitRadius}
        radius={chairRadius}
        fill="rgba(148,163,184,0.25)"
        stroke="rgba(148,163,184,0.15)"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  return (
    <>
      <DraggableGroup item={item} onSelect={onSelect} onChange={onChange}>
        {chairs}
        <Circle
          ref={shapeRef}
          radius={tableRadius}
          fill="rgba(255,255,255,0.85)"
          stroke={isSelected ? '#00d4ff' : 'rgba(255,255,255,0.15)'}
          strokeWidth={isSelected ? 2 : 1}
          shadowColor="rgba(0,0,0,0.25)"
          shadowBlur={10}
          shadowOffsetY={3}
        />
        <Circle
          radius={20}
          fill="rgba(56,189,248,0.12)"
          stroke="rgba(56,189,248,0.2)"
          strokeWidth={1}
          listening={false}
        />
        <Text
          text="10"
          fontSize={12}
          fontStyle="bold"
          fill="rgba(30,41,59,0.6)"
          width={40}
          align="center"
          offsetX={20}
          offsetY={6}
          listening={false}
        />
      </DraggableGroup>
      <SelectionTransformer shapeRef={shapeRef} isSelected={isSelected} onChange={onChange} offset={30} />
    </>
  );
}

function TableRectShape({ item, isSelected, onSelect, onChange }: ShapeProps) {
  const shapeRef = useRef<Konva.Rect>(null);

  const rectW = 140;
  const rectH = 50;
  const chairsPerSide = 4;
  const chairs: React.ReactElement[] = [];
  for (let i = 0; i < chairsPerSide; i++) {
    const cx = -rectW / 2 + (rectW / (chairsPerSide + 1)) * (i + 1);
    chairs.push(
      <Rect key={`top-${i}`} x={cx - 6} y={-rectH / 2 - 16} width={12} height={10} cornerRadius={3} fill="rgba(148,163,184,0.25)" stroke="rgba(148,163,184,0.15)" strokeWidth={1} listening={false} />
    );
    chairs.push(
      <Rect key={`bot-${i}`} x={cx - 6} y={rectH / 2 + 6} width={12} height={10} cornerRadius={3} fill="rgba(148,163,184,0.25)" stroke="rgba(148,163,184,0.15)" strokeWidth={1} listening={false} />
    );
  }

  return (
    <>
      <DraggableGroup item={item} onSelect={onSelect} onChange={onChange}>
        {chairs}
        <Rect
          ref={shapeRef}
          width={rectW}
          height={rectH}
          offsetX={rectW / 2}
          offsetY={rectH / 2}
          fill="rgba(255,255,255,0.85)"
          cornerRadius={5}
          stroke={isSelected ? '#00d4ff' : 'rgba(255,255,255,0.15)'}
          strokeWidth={isSelected ? 2 : 1}
          shadowColor="rgba(0,0,0,0.25)"
          shadowBlur={10}
          shadowOffsetY={3}
        />
        <Text text="ĐẠI BIỂU" fontSize={10} fontStyle="bold" fill="rgba(30,41,59,0.5)" width={rectW} align="center" offsetX={rectW / 2} offsetY={5} listening={false} />
      </DraggableGroup>
      <SelectionTransformer shapeRef={shapeRef} isSelected={isSelected} onChange={onChange} />
    </>
  );
}

function FlowerShape({ item, isSelected, onSelect, onChange }: ShapeProps) {
  const shapeRef = useRef<Konva.Star>(null);

  return (
    <>
      <DraggableGroup item={item} onSelect={onSelect} onChange={onChange}>
        <Star numPoints={6} innerRadius={12} outerRadius={28} fill="rgba(244,114,182,0.15)" listening={false} />
        <Star
          ref={shapeRef}
          numPoints={6}
          innerRadius={10}
          outerRadius={22}
          fill="#f472b6"
          stroke={isSelected ? '#00d4ff' : 'rgba(244,114,182,0.4)'}
          strokeWidth={isSelected ? 2 : 1}
          shadowColor="rgba(244,114,182,0.4)"
          shadowBlur={12}
        />
        <Circle radius={5} fill="#fbbf24" listening={false} />
      </DraggableGroup>
      <SelectionTransformer shapeRef={shapeRef} isSelected={isSelected} onChange={onChange} />
    </>
  );
}

// ═══════════════════════════════════════════════════
//  NEW SHAPES
// ═══════════════════════════════════════════════════

// ── Spotlight (đèn chiếu) ──
function SpotlightShape({ item, isSelected, onSelect, onChange }: ShapeProps) {
  const shapeRef = useRef<Konva.Circle>(null);

  return (
    <>
      <DraggableGroup item={item} onSelect={onSelect} onChange={onChange}>
        {/* Light cone glow */}
        <Star
          numPoints={12}
          innerRadius={18}
          outerRadius={30}
          fill="rgba(250,204,21,0.08)"
          listening={false}
        />
        {/* Outer glow ring */}
        <Circle radius={22} fill="rgba(250,204,21,0.12)" listening={false} />
        {/* Lamp body */}
        <Circle
          ref={shapeRef}
          radius={14}
          fill="#1e1e1e"
          stroke={isSelected ? '#00d4ff' : 'rgba(250,204,21,0.6)'}
          strokeWidth={isSelected ? 2 : 1.5}
          shadowColor="rgba(250,204,21,0.5)"
          shadowBlur={16}
        />
        {/* Bulb */}
        <Circle radius={7} fill="#fbbf24" opacity={0.9} listening={false} />
        {/* Bright center */}
        <Circle radius={3} fill="#fef9c3" listening={false} />
      </DraggableGroup>
      <SelectionTransformer shapeRef={shapeRef} isSelected={isSelected} onChange={onChange} />
    </>
  );
}

// ── Disco Light (đèn nháy) ──
function DiscoLightShape({ item, isSelected, onSelect, onChange }: ShapeProps) {
  const shapeRef = useRef<Konva.Circle>(null);

  // Colorful rays
  const rays: React.ReactElement[] = [];
  const rayColors = ['#a78bfa', '#fb7185', '#34d399', '#38bdf8', '#fbbf24', '#f472b6'];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    rays.push(
      <Line
        key={`ray-${i}`}
        points={[0, 0, Math.cos(angle) * 32, Math.sin(angle) * 32]}
        stroke={rayColors[i]}
        strokeWidth={2}
        opacity={0.35}
        listening={false}
        lineCap="round"
      />
    );
  }

  return (
    <>
      <DraggableGroup item={item} onSelect={onSelect} onChange={onChange}>
        {rays}
        {/* Outer ring */}
        <Circle radius={18} fill="rgba(139,92,246,0.1)" listening={false} />
        {/* Body */}
        <Circle
          ref={shapeRef}
          radius={13}
          fill="#2d2040"
          stroke={isSelected ? '#00d4ff' : 'rgba(139,92,246,0.6)'}
          strokeWidth={isSelected ? 2 : 1.5}
          shadowColor="rgba(139,92,246,0.6)"
          shadowBlur={14}
        />
        {/* Inner disco pattern */}
        <RegularPolygon sides={6} radius={7} fill="#8b5cf6" opacity={0.8} listening={false} />
        <Circle radius={3} fill="#c4b5fd" listening={false} />
      </DraggableGroup>
      <SelectionTransformer shapeRef={shapeRef} isSelected={isSelected} onChange={onChange} />
    </>
  );
}

// ── Curtain (rèm sân khấu) ──
function CurtainShape({ item, isSelected, onSelect, onChange }: ShapeProps) {
  const shapeRef = useRef<Konva.Rect>(null);
  const curtainW = 20;
  const curtainH = 100;

  // Drape folds (vertical lines)
  const folds: React.ReactElement[] = [];
  for (let i = 1; i < 4; i++) {
    folds.push(
      <Line
        key={`fold-${i}`}
        points={[
          -curtainW / 2 + (curtainW / 4) * i, -curtainH / 2,
          -curtainW / 2 + (curtainW / 4) * i, curtainH / 2,
        ]}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  return (
    <>
      <DraggableGroup item={item} onSelect={onSelect} onChange={onChange}>
        {/* Shadow behind */}
        <Rect
          width={curtainW + 4}
          height={curtainH + 4}
          offsetX={(curtainW + 4) / 2}
          offsetY={(curtainH + 4) / 2}
          fill="rgba(0,0,0,0.3)"
          cornerRadius={3}
          listening={false}
        />
        {/* Curtain body */}
        <Rect
          ref={shapeRef}
          width={curtainW}
          height={curtainH}
          offsetX={curtainW / 2}
          offsetY={curtainH / 2}
          fill="#991b1b"
          cornerRadius={2}
          stroke={isSelected ? '#00d4ff' : 'rgba(220,38,38,0.4)'}
          strokeWidth={isSelected ? 2 : 1}
          shadowColor="rgba(220,38,38,0.3)"
          shadowBlur={8}
        />
        {folds}
        {/* Top rod / valance */}
        <Rect
          width={curtainW + 6}
          height={6}
          offsetX={(curtainW + 6) / 2}
          offsetY={curtainH / 2 + 3}
          fill="#fbbf24"
          cornerRadius={3}
          opacity={0.8}
          listening={false}
        />
        <Text
          text="RÈM"
          fontSize={8}
          fontStyle="bold"
          fill="rgba(255,255,255,0.4)"
          width={curtainW}
          align="center"
          offsetX={curtainW / 2}
          offsetY={4}
          listening={false}
          rotation={0}
        />
      </DraggableGroup>
      <SelectionTransformer shapeRef={shapeRef} isSelected={isSelected} onChange={onChange} />
    </>
  );
}

// ── Flower Arch (cổng hoa vòm) ──
function FlowerArchShape({ item, isSelected, onSelect, onChange }: ShapeProps) {
  const shapeRef = useRef<Konva.Rect>(null);
  const archW = 90;
  const archH = 12;
  const pillarW = 10;
  const pillarH = 60;

  // Small flowers along the arch
  const flowers: React.ReactElement[] = [];
  const flowerColors = ['#f9a8d4', '#f472b6', '#fb7185', '#fda4af', '#e879f9'];
  for (let i = 0; i < 7; i++) {
    const fx = -archW / 2 + (archW / 8) * (i + 1);
    flowers.push(
      <Star
        key={`af-${i}`}
        x={fx}
        y={-pillarH / 2}
        numPoints={5}
        innerRadius={3}
        outerRadius={6}
        fill={flowerColors[i % flowerColors.length]}
        opacity={0.7}
        listening={false}
      />
    );
  }

  return (
    <>
      <DraggableGroup item={item} onSelect={onSelect} onChange={onChange}>
        {/* Left pillar */}
        <Rect
          x={-archW / 2 - pillarW / 2}
          y={-pillarH / 2}
          width={pillarW}
          height={pillarH}
          fill="rgba(209,213,219,0.6)"
          cornerRadius={3}
          listening={false}
        />
        {/* Right pillar */}
        <Rect
          x={archW / 2 - pillarW / 2}
          y={-pillarH / 2}
          width={pillarW}
          height={pillarH}
          fill="rgba(209,213,219,0.6)"
          cornerRadius={3}
          listening={false}
        />
        {/* Arch top bar (the main selectable element) */}
        <Rect
          ref={shapeRef}
          width={archW}
          height={archH}
          offsetX={archW / 2}
          offsetY={pillarH / 2 + archH / 2}
          fill="#f9a8d4"
          cornerRadius={6}
          stroke={isSelected ? '#00d4ff' : 'rgba(244,114,182,0.4)'}
          strokeWidth={isSelected ? 2 : 1}
          shadowColor="rgba(244,114,182,0.4)"
          shadowBlur={10}
        />
        {/* Flowers on the arch */}
        {flowers}
        <Text
          text="CỔNG HOA"
          fontSize={9}
          fontStyle="bold"
          fill="rgba(255,255,255,0.5)"
          width={archW}
          align="center"
          offsetX={archW / 2}
          offsetY={0}
          listening={false}
        />
      </DraggableGroup>
      <SelectionTransformer shapeRef={shapeRef} isSelected={isSelected} onChange={onChange} />
    </>
  );
}

// ─── Shape Renderer Factory ───
function RenderItem({ item, isSelected, onSelect }: { item: StageItem; isSelected: boolean; onSelect: () => void }) {
  const { updateItem } = useStageBuilderStore();
  const handleChange = useCallback(
    (updates: Partial<StageItem>) => updateItem(item.id, updates),
    [item.id, updateItem]
  );

  const props: ShapeProps = { item, isSelected, onSelect, onChange: handleChange };

  switch (item.type) {
    case 'stage':
      return <StageShape {...props} />;
    case 'table_round':
      return <TableRoundShape {...props} />;
    case 'table_rect':
      return <TableRectShape {...props} />;
    case 'flower':
      return <FlowerShape {...props} />;
    case 'spotlight':
      return <SpotlightShape {...props} />;
    case 'disco_light':
      return <DiscoLightShape {...props} />;
    case 'curtain':
      return <CurtainShape {...props} />;
    case 'flower_arch':
      return <FlowerArchShape {...props} />;
    default:
      return null;
  }
}

// ─── Main Canvas ───
export default function KonvaCanvas() {
  const { items, selectedItemId, selectItem, addItem } = useStageBuilderStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle drop from sidebar
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('itemType') as ItemType;
    if (!type) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addItem({
      id: generateId(type),
      type,
      x,
      y,
      rotation: 0,
      scale: 1,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Click on empty space → deselect
  const handleStageClick = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectItem(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="flex-1 relative overflow-hidden bg-[#080d1a] rounded-2xl border border-white/5"
    >
      {/* Empty State */}
      {items.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-dashed border-white/10 flex items-center justify-center mb-4">
            <LayoutGrid className="w-8 h-8 text-white/10" />
          </div>
          <p className="text-sm text-white/20 font-medium">Kéo thả vật phẩm từ thanh bên trái</p>
          <p className="text-[10px] text-white/10 mt-1">hoặc click để thêm vào giữa canvas</p>
        </div>
      )}

      <Stage
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleStageClick}
        onTap={handleStageClick}
        style={{ background: '#080d1a' }}
      >
        <Layer>
          <GridLines />
          {items.map((item) => (
            <RenderItem
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              onSelect={() => selectItem(item.id)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
