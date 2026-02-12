import { createContext, useContext, RefObject } from 'react';

const ControlsContext = createContext<RefObject<any> | null>(null);

export const useControlsRef = () => {
    const context = useContext(ControlsContext);
    return context;
};

export default ControlsContext;
