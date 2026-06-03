type RouterConRefresh = {
  refresh: () => void;
};

export function refrescarVista(enrutador: RouterConRefresh)
{
    enrutador.refresh();
}
