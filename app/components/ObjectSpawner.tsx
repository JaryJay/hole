"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Tree from "./Tree";
import PineTree from "./PineTree";
import LargeTree from "./LargeTree";
import Goose from "./Goose";
import VillageHouse from "./VillageHouse";

interface ObjectSpawnerProps {
  holeSize: number;
  playerPosition: [number, number, number];
  onObjectDespawn: () => void;
}

interface SpawnedObject {
  id: string;
  type: 'tree' | 'pineTree' | 'largeTree' | 'goose' | 'villageHouse';
  position: [number, number, number];
  spawnTime: number;
}

// Calculate target number of objects based on hole size
const calculateTargetObjects = (holeSize: number): number => {
  const baseObjects = 40; // Start with fewer objects
  const scaleFactor = Math.floor(holeSize * 20); // Scale more aggressively
  return Math.min(baseObjects + scaleFactor, 200);
};

// Generate a random object type
const generateObjectType = (): SpawnedObject['type'] => {
  const rand = Math.random();
  if (rand < 0.35) return 'tree';
  if (rand < 0.60) return 'pineTree';
  if (rand < 0.80) return 'largeTree';
  if (rand < 0.95) return 'goose';
  return 'villageHouse';
};

// Generate a random position around the player, avoiding the hole
const generateSpawnPosition = (
  playerPosition: [number, number, number],
  holeSize: number
): [number, number, number] => {
  const safeDistance = holeSize + 8; // Increased safe distance
  const maxDistance = 35;
  
  // Generate random angle and distance
  const angle = Math.random() * Math.PI * 2;
  const distance = safeDistance + Math.random() * (maxDistance - safeDistance);
  
  const x = playerPosition[0] + Math.cos(angle) * distance;
  const z = playerPosition[2] + Math.sin(angle) * distance;
  
  return [x, 2, z]; // Y will be adjusted per object type
};

export default function ObjectSpawner({ holeSize, playerPosition, onObjectDespawn }: ObjectSpawnerProps) {
  const [objects, setObjects] = useState<SpawnedObject[]>([]);
  const nextIdRef = useRef(0);
  const lastSpawnTimeRef = useRef(Date.now());
  
  // Calculate how many objects we should have
  const targetObjectCount = calculateTargetObjects(holeSize);
  
  // Spawn interval: spawn objects more frequently when we have fewer objects
  const getSpawnInterval = (): number => {
    const deficit = targetObjectCount - objects.length;
    if (deficit <= 0) return 10000; // No need to spawn, check every 10 seconds
    if (deficit < 5) return 3000; // Spawn every 3 seconds when close to target
    if (deficit < 15) return 1500; // Spawn every 1.5 seconds for moderate deficit
    return 1000; // Spawn every 1 second when we need many objects
  };
  
  // Remove an object when it despawns
  const handleObjectDespawn = useCallback((objectId: string) => {
    setObjects(prevObjects => {
      const filtered = prevObjects.filter(obj => obj.id !== objectId);
      console.log(`Object ${objectId} despawned. Remaining objects: ${filtered.length}`);
      return filtered;
    });
    onObjectDespawn(); // Notify parent (to grow hole)
  }, [onObjectDespawn]);
  
  // Spawn new objects periodically
  useEffect(() => {
    const spawnObjects = () => {
      const now = Date.now();
      const timeSinceLastSpawn = now - lastSpawnTimeRef.current;
      const spawnInterval = getSpawnInterval();
      
      if (timeSinceLastSpawn < spawnInterval) return;
      
      setObjects(prevObjects => {
        const currentCount = prevObjects.length;
        const target = calculateTargetObjects(holeSize);
        
        if (currentCount >= target) return prevObjects;
        
        // Spawn 1-3 objects at a time, depending on deficit
        const deficit = target - currentCount;
        const spawnCount = Math.min(deficit, Math.max(1, Math.floor(deficit / 10)));
        
        const newObjects: SpawnedObject[] = [];
        
        for (let i = 0; i < spawnCount; i++) {
          const type = generateObjectType();
          const basePosition = generateSpawnPosition(playerPosition, holeSize);
          
          // Adjust Y position based on object type
          const position: [number, number, number] = [
            basePosition[0],
            type === 'goose' ? 8 : (type === 'villageHouse' ? 3 : 2),
            basePosition[2]
          ];
          
          const newObject: SpawnedObject = {
            id: `obj-${nextIdRef.current++}`,
            type,
            position,
            spawnTime: now
          };
          
          newObjects.push(newObject);
        }
        
        if (newObjects.length > 0) {
          console.log(`Spawned ${newObjects.length} new objects. Total: ${currentCount + newObjects.length}/${target}`);
        }
        
        lastSpawnTimeRef.current = now;
        return [...prevObjects, ...newObjects];
      });
    };
    
    // Initial spawn
    spawnObjects();
    
    // Set up periodic spawning
    const interval = setInterval(spawnObjects, 100); // Check every 100ms
    
    return () => clearInterval(interval);
  }, [holeSize, playerPosition]); // Only depend on holeSize and playerPosition changes
  
  // Clean up objects that are too far from player (prevent infinite accumulation)
  useEffect(() => {
    const cleanupDistantObjects = () => {
      setObjects(prevObjects => {
        const beforeCount = prevObjects.length;
        const filtered = prevObjects.filter(obj => {
          const distance = Math.sqrt(
            Math.pow(obj.position[0] - playerPosition[0], 2) +
            Math.pow(obj.position[2] - playerPosition[2], 2)
          );
          
          // Keep objects within 100 units of player
          return distance < 100;
        });
        
        if (filtered.length < beforeCount) {
          console.log(`Cleaned up ${beforeCount - filtered.length} distant objects`);
        }
        
        return filtered;
      });
    };
    
    // Clean up every 10 seconds
    const cleanupInterval = setInterval(cleanupDistantObjects, 10000);
    
    return () => clearInterval(cleanupInterval);
  }, [playerPosition]);
  
  const renderObject = (obj: SpawnedObject) => {
    const commonProps = {
      key: obj.id,
      position: obj.position,
      onDespawn: () => handleObjectDespawn(obj.id)
    };

    switch (obj.type) {
      case 'tree':
        return <Tree {...commonProps} />;
      case 'pineTree':
        return <PineTree {...commonProps} />;
      case 'largeTree':
        return <LargeTree {...commonProps} />;
      case 'goose':
        return <Goose {...commonProps} />;
      case 'villageHouse':
        return <VillageHouse {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      {objects.map(renderObject)}
    </>
  );
}