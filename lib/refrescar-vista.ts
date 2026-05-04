type RouterConRefresh = {
  refresh: () => void;
};

export function refrescarVista(router: RouterConRefresh) {
  router.refresh();
}
