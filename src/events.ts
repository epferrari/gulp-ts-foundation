
export interface GulpEvent {
    uid: string;
    name: string;
}

export type RegistryEvents = {
    gulp_start: null;
    gulp_task_start: GulpEvent;
    gulp_task_stop: GulpEvent;
    gulp_done: null;
};