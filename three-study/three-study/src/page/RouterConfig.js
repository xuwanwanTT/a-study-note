import { lazy } from "react";

export const RouterList = [
  { component: lazy(() => import('./three-scene-1/ThreeScene1.js')), pathname: '/' },
];