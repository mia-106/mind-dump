import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';

export interface PhysicsCanvasHandle {
  addTrash: (color: string, position?: { x: number, y: number }, id?: string, content?: string, aiReply?: string) => void;
  clearTrash: () => void;
  removeTrash: (id: string) => void;
  updateTrash: (id: string, newColor: string, newContent: string, newAiReply?: string) => void;
  setPaused: (paused: boolean) => void;
  restoreTrash: (items: Array<{ id: string, color: string, content: string, aiReply?: string }>) => void;
}

interface PhysicsCanvasProps {
  onEmptyClick?: () => void;
  onBallClick?: (data: { id?: string, content: string, color: string, x: number, y: number, aiReply?: string }) => void;
}

const PhysicsCanvas = forwardRef<PhysicsCanvasHandle, PhysicsCanvasProps>(({ onEmptyClick, onBallClick }, ref) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  useImperativeHandle(ref, () => ({
    addTrash: (color: string, position?: { x: number, y: number }, id?: string, content?: string, aiReply?: string) => {
      if (!engineRef.current) return;
      
      const width = 300;
      // Spawn centrally to fit new size: width 300, walls at ~70 and ~230. 
      // Available space ~160. Ball width ~70-80. 
      // Safe range: 110 to 190.
      const x = position ? position.x : (110 + Math.random() * 80);
      const y = position ? position.y : 10; // Start inside the bin to avoid immediate clamping

      // Create "Crumpled Paper" shape using randomized vertices
      const size = 28; // Base radius (reduced from 35)
      const sides = 10; // Number of vertices for "crumple"
      const step = (Math.PI * 2) / sides;
      const vertices = [];
      
      for (let i = 0; i < sides; i++) {
        // Randomize radius to create jagged edges
        const r = size * (0.8 + Math.random() * 0.4); 
        const theta = i * step;
        vertices.push({ 
            x: Math.cos(theta) * r, 
            y: Math.sin(theta) * r 
        });
      }

      // Generate internal creases (Pinch Fold Pattern)
      const creases = [];
      // 1. Pick a random "pinch point" near the center
      const pinchX = (Math.random() - 0.5) * size * 0.4;
      const pinchY = (Math.random() - 0.5) * size * 0.4;

      // 2. Connect 3 random vertices to this pinch point to create "folds"
      const indices = [];
      while(indices.length < 3) {
        const idx = Math.floor(Math.random() * sides);
        if(!indices.includes(idx)) indices.push(idx);
      }

      indices.forEach(idx => {
         creases.push({
            x1: vertices[idx].x,
            y1: vertices[idx].y,
            x2: pinchX,
            y2: pinchY
         });
      });

      // 3. Occasionally add one cross-line between two distant vertices
      const idxA = Math.floor(Math.random() * sides);
      const idxB = (idxA + Math.floor(sides/2)) % sides; // Opposite side
      if (Math.random() > 0.6) {
          creases.push({
            x1: vertices[idxA].x,
            y1: vertices[idxA].y,
            x2: vertices[idxB].x,
            y2: vertices[idxB].y
          });
      }

      const ball = Matter.Bodies.fromVertices(x, y, [vertices], {
        label: id || 'trash', // Use ID as label if provided
        restitution: 0.1, // Almost no bounce (Low restitution)
        friction: 0.5,    // High friction (Sticky paper)
        frictionAir: 0.08, // High air resistance (Thick air)
        density: 0.002,   // Standard density
        render: {
          visible: false, // Hide default rendering
        },
        plugin: {
          wrapColor: color,
          creases: creases,
          type: 'paperBall', // Mark as paper ball for global logic
          content: content || '',
          aiReply: aiReply || ''
        },
        angle: Math.random() * Math.PI,
      });

      if (ball) {
        Matter.World.add(engineRef.current.world, ball);
      }
    },
    clearTrash: () => {
      if (!engineRef.current) return;
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const trash = bodies.filter(b => !b.isStatic);
      Matter.World.remove(engineRef.current.world, trash);
    },
    removeTrash: (id: string) => {
      if (!engineRef.current) return;
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const trashToRemove = bodies.find(b => b.label === id);
      if (trashToRemove) {
        Matter.World.remove(engineRef.current.world, trashToRemove);
      }
    },
    updateTrash: (id: string, newColor: string, newContent: string, newAiReply?: string) => {
      if (!engineRef.current) return;
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const trashToUpdate = bodies.find(b => b.label === id);
      if (trashToUpdate && trashToUpdate.plugin) {
        trashToUpdate.plugin.wrapColor = newColor;
        trashToUpdate.plugin.content = newContent;
        if (newAiReply !== undefined) {
          trashToUpdate.plugin.aiReply = newAiReply;
        }
      }
    },
    setPaused: (paused: boolean) => {
      if (runnerRef.current) {
        runnerRef.current.enabled = !paused;
      }
    },
    restoreTrash: (items: Array<{ id: string, color: string, content: string }>) => {
      if (!engineRef.current) return;
      
      // Clear existing first to avoid duplicates if called multiple times
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const trash = bodies.filter(b => b.label !== 'Rectangle Body' && !b.isStatic); // Filter dynamic bodies
      // Better: filter by label or plugin type
      const existingTrash = bodies.filter(b => b.plugin && b.plugin.type === 'paperBall');
      Matter.World.remove(engineRef.current.world, existingTrash);

      items.forEach((item, index) => {
        // Randomize position slightly more for bulk restoration to prevent stacking
        // Spread Y to avoid instant collision
        const x = 110 + Math.random() * 80;
        const y = -50 - (index * 50); // Stack upwards
        
        // Call internal logic directly or duplicate code? 
        // Duplicating core creation logic for simplicity to access local scope vars
        
        const size = 28;
        const sides = 10;
        const step = (Math.PI * 2) / sides;
        const vertices = [];
        for (let i = 0; i < sides; i++) {
            const r = size * (0.8 + Math.random() * 0.4); 
            const theta = i * step;
            vertices.push({ x: Math.cos(theta) * r, y: Math.sin(theta) * r });
        }
        
        const creases = [];
        const pinchX = (Math.random() - 0.5) * size * 0.4;
        const pinchY = (Math.random() - 0.5) * size * 0.4;
        const indices = [];
        while(indices.length < 3) {
            const idx = Math.floor(Math.random() * sides);
            if(!indices.includes(idx)) indices.push(idx);
        }
        indices.forEach(idx => {
            creases.push({ x1: vertices[idx].x, y1: vertices[idx].y, x2: pinchX, y2: pinchY });
        });
        const idxA = Math.floor(Math.random() * sides);
        const idxB = (idxA + Math.floor(sides/2)) % sides;
        if (Math.random() > 0.6) {
            creases.push({ x1: vertices[idxA].x, y1: vertices[idxA].y, x2: vertices[idxB].x, y2: vertices[idxB].y });
        }

        const ball = Matter.Bodies.fromVertices(x, y, [vertices], {
            label: item.id,
            restitution: 0.1,
            friction: 0.5,
            frictionAir: 0.08,
            density: 0.002,
            render: { visible: false },
            plugin: {
                wrapColor: item.color,
                creases: creases,
                type: 'paperBall',
                content: item.content
            },
            angle: Math.random() * Math.PI,
        });

        if (ball) {
            Matter.World.add(engineRef.current.world, ball);
        }
      });
    }
  }));

  useEffect(() => {
    if (!sceneRef.current) return;

    // Setup Matter.js
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Runner = Matter.Runner;
    const Events = Matter.Events;
    const Composite = Matter.Composite;

    const engine = Engine.create();
    engineRef.current = engine;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 300,
        height: 350,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio,
      },
    });
    renderRef.current = render;

    // Walls - Fortress Level Thickness (500px)
    const wallOptions = { 
      isStatic: true, 
      render: { visible: false } // Invisible walls
      // render: { visible: true, fillStyle: 'red' } // Debug
    };

    // Calculate wall geometry based on trapezoid: 
    // Top: 50-250, Bottom: 70-230, Height: 350.
    // To make walls 500px thick but keep the inner surface same:
    // We need to offset the center position outwards by (500/2 + original_thickness/2)
    
    // Left Wall: Inner surface from (50,0) to (70,350)
    // Angle: ~0.057 rad.
    // Original center was (60, 175). 
    // New thickness: 500. 
    // We want the right face of this huge block to be where the old wall was.
    // Shift left by ~250px.
    const leftWall = Bodies.rectangle(60 - 250, 175, 500, 800, {
      ...wallOptions,
      angle: 0.057
    });

    // Right Wall: Inner surface from (250,0) to (230,350)
    // Original center (240, 175).
    // Shift right by ~250px.
    const rightWall = Bodies.rectangle(240 + 250, 175, 500, 800, {
      ...wallOptions,
      angle: -0.057
    });

    // Bottom Wall: Inner surface at y=250.
    // Original center (150, 298) with height 100 -> top at 248.
    // We want top at 250. 
    // Height 500 -> Center at 250 + 250 = 500.
    const bottomWall = Bodies.rectangle(150, 500, 800, 500, wallOptions);

    // Invisible Ceiling (The last line of defense)
    // Placed above the opening. Bottom at y=0.
    // Height 500 -> Center at 0 - 250 = -250.
    const ceiling = Bodies.rectangle(150, -250, 800, 500, wallOptions);

    World.add(engine.world, [leftWall, rightWall, bottomWall, ceiling]);

    // Add mouse control for fun interaction
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });
    World.add(engine.world, mouseConstraint);

    // Keep the mouse in sync with rendering
    render.mouse = mouse;

    // Smart Click Detection
    let startPoint = { x: 0, y: 0 };
    let initialClickedBody: Matter.Body | null = null;

    Events.on(mouseConstraint, 'mousedown', (event) => {
      const mousePosition = event.mouse.position;
      startPoint = { ...mousePosition };
      
      const bodies = Composite.allBodies(engine.world);
      const dynamicBodies = bodies.filter(b => !b.isStatic);
      const clickedBodies = Matter.Query.point(dynamicBodies, mousePosition);
      
      if (clickedBodies.length > 0) {
        initialClickedBody = clickedBodies[0];
        render.canvas.style.cursor = 'grab';
      } else {
        initialClickedBody = null;
        render.canvas.style.cursor = 'pointer';
      }
    });

    Events.on(mouseConstraint, 'mousemove', (event) => {
      const mousePosition = event.mouse.position;
      const bodies = Composite.allBodies(engine.world);
      const dynamicBodies = bodies.filter(b => !b.isStatic);
      const hoveredBodies = Matter.Query.point(dynamicBodies, mousePosition);

      if (hoveredBodies.length > 0) {
        render.canvas.style.cursor = 'grab';
      } else {
        render.canvas.style.cursor = 'pointer';
      }
    });

    Events.on(mouseConstraint, 'mouseup', (event) => {
      render.canvas.style.cursor = 'default';
      
      const endPoint = event.mouse.position;
      const distance = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);

      if (distance < 5) {
        if (initialClickedBody && onBallClick) {
           // It was a click on a paper ball
           const rect = render.canvas.getBoundingClientRect();
           onBallClick({
             id: initialClickedBody.label, // Pass ID
             content: initialClickedBody.plugin.content || '',
             color: initialClickedBody.plugin.wrapColor || '#ffffff',
             x: initialClickedBody.position.x + rect.left,
             y: initialClickedBody.position.y + rect.top,
             aiReply: initialClickedBody.plugin.aiReply
           });
        } else if (!initialClickedBody && onEmptyClick) {
           // It was a click on empty space
           onEmptyClick();
        }
      }
      
      initialClickedBody = null;
    });

    // Trapezoid Boundaries (Trapezoid Logic)
    // Defined to match the visual bin walls
    const topY = 0;
    const bottomY = 250;
    const topLeftX = 60;
    const topRightX = 240;
    const bottomLeftX = 75;
    const bottomRightX = 225;

    // Force Position Clamping (afterUpdate) - Global Containment Protocol
    Events.on(engine, 'afterUpdate', () => {
      // 1. Global Loop: Check ALL paper balls, not just the dragged one
      const allBalls = Composite.allBodies(engine.world).filter(body => body.plugin && body.plugin.type === 'paperBall');
      
      const r = 20; // Safe radius assumption
      const MAX_VELOCITY = 15; // Speed Limit

      allBalls.forEach(ball => {
        const pos = ball.position;
        const vel = ball.velocity;
        
        // --- 0. Physics Hard-cap (Speed Limit) ---
        // If moving too fast, clamp velocity
        if (Math.abs(vel.x) > MAX_VELOCITY || Math.abs(vel.y) > MAX_VELOCITY) {
          Matter.Body.setVelocity(ball, {
            x: Math.max(Math.min(vel.x, MAX_VELOCITY), -MAX_VELOCITY),
            y: Math.max(Math.min(vel.y, MAX_VELOCITY), -MAX_VELOCITY)
          });
        }

        // --- 1. Global Safety Net (The Void Check) ---
        // If it escapes the "Outer Perimeter" of the canvas + margin
        // Canvas is 300x350. Let's say margin is 100px.
        // If x < -100 or x > 400 or y < -100 or y > 450
        // (Note: y < -260 is blocked by ceiling, but just in case)
        if (pos.x < -100 || pos.x > 400 || pos.y > 450 || pos.y < -300 || isNaN(pos.x) || isNaN(pos.y)) {
           // Teleport Protocol: Reset to safe drop zone
           Matter.Body.setPosition(ball, { x: 150, y: 50 });
           Matter.Body.setVelocity(ball, { x: 0, y: 0 });
           // Stop processing this ball to prevent conflict
           return; 
        }

        let clampedX = pos.x;
        let clampedY = pos.y;
        let shouldClamp = false;

        // --- 2. Multi-Layer Clamping (Inner Logic) ---
        // Y-Axis Clamp
        if (pos.y < topY + r) { clampedY = topY + r; shouldClamp = true; }
        if (pos.y > bottomY - r) { clampedY = bottomY - r; shouldClamp = true; }

        // X-Axis Clamp (Trapezoid Logic)
        // Calculate allowed width at current Y (clampedY to be safe)
        const t = (clampedY - topY) / (bottomY - topY);
        const currentLeftX = topLeftX + (bottomLeftX - topLeftX) * t;
        const currentRightX = topRightX + (bottomRightX - topRightX) * t;

        if (pos.x < currentLeftX + r) { clampedX = currentLeftX + r; shouldClamp = true; }
        if (pos.x > currentRightX - r) { clampedX = currentRightX - r; shouldClamp = true; }

        // 4. Execute Clamp & Kill Velocity
        if (shouldClamp) {
           Matter.Body.setPosition(ball, { x: clampedX, y: clampedY });
           // Hard stop to prevent jitter/bouncing at invisible walls
           Matter.Body.setVelocity(ball, { x: 0, y: 0 });
        }
      });
    });

    // Custom Rendering for Crumpled Paper effect & Debug Visuals
    Events.on(render, 'afterRender', () => {
      const context = render.context;
      
      // Debug Mode: Visualize the Clamping Trapezoid
      // Uncomment to see the safe area
      /*
      context.beginPath();
      context.fillStyle = 'red';
      const debugRadius = 4;
      // Top Left
      context.moveTo(topLeftX, topY);
      context.arc(topLeftX, topY, debugRadius, 0, 2 * Math.PI);
      // Top Right
      context.moveTo(topRightX, topY);
      context.arc(topRightX, topY, debugRadius, 0, 2 * Math.PI);
      // Bottom Left
      context.moveTo(bottomLeftX, bottomY);
      context.arc(bottomLeftX, bottomY, debugRadius, 0, 2 * Math.PI);
      // Bottom Right
      context.moveTo(bottomRightX, bottomY);
      context.arc(bottomRightX, bottomY, debugRadius, 0, 2 * Math.PI);
      context.fill();
      
      // Draw lines
      context.beginPath();
      context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      context.lineWidth = 1;
      context.moveTo(topLeftX, topY);
      context.lineTo(topRightX, topY);
      context.lineTo(bottomRightX, bottomY);
      context.lineTo(bottomLeftX, bottomY);
      context.closePath();
      context.stroke();
      */

      const bodies = Composite.allBodies(engine.world);

      bodies.forEach(body => {
        // Check if it's our trash item by looking for the custom plugin data
        if (body.plugin && body.plugin.creases) {
          const { wrapColor, creases } = body.plugin;

          // 1. Draw Body Shape (Fill & Border)
          context.beginPath();
          body.vertices.forEach((v, i) => {
            if (i === 0) context.moveTo(v.x, v.y);
            else context.lineTo(v.x, v.y);
          });
          context.closePath();
          
          context.fillStyle = wrapColor;
          context.fill();
          
          context.lineWidth = 2;
          context.strokeStyle = '#000000';
          context.lineJoin = 'round';
          context.lineCap = 'round';
          context.stroke();

          // 2. Draw Internal Creases
          context.beginPath();
          const c = Math.cos(body.angle);
          const s = Math.sin(body.angle);
          
          creases.forEach((crease: any) => {
            // Rotate and translate relative to body center
            const x1 = body.position.x + (crease.x1 * c - crease.y1 * s);
            const y1 = body.position.y + (crease.x1 * s + crease.y1 * c);
            const x2 = body.position.x + (crease.x2 * c - crease.y2 * s);
            const y2 = body.position.y + (crease.x2 * s + crease.y2 * c);
            
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
          });
          
          context.lineWidth = 1.5; // Slightly thinner for internal lines
          context.strokeStyle = '#000000';
          context.stroke();
        }
      });
    });

    // Run
    Render.run(render);
    
    // Create runner
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas) {
        render.canvas.remove();
      }
    };
  }, []);

  return (
    <div 
      ref={sceneRef} 
      className="w-[300px] h-[250px]"
    />
  );
});

export default PhysicsCanvas;
