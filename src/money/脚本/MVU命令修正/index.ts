type MvuCommand = {
  args: any[];
};

function pointerToPath(path: string) {
  if (!path.startsWith('/')) return path.replace(/^stat_data\./, '');
  return path
    .split('/')
    .slice(1)
    .map(part => part.replace(/~1/g, '/').replace(/~0/g, '~'))
    .join('.');
}

function normalizeCommandPath(command: MvuCommand) {
  if (!command.args.length || typeof command.args[0] !== 'string') return;
  command.args[0] = pointerToPath(command.args[0])
    .split('.')
    .map(part => part.trim().replace(/[:：]\s*$/, '').trim())
    .join('.');
}

$(async () => {
  await waitGlobalInitialized('Mvu');

  eventOn(Mvu.events.COMMAND_PARSED, (...args: any[]) => {
    const commands = args.length >= 3 ? args[1] : args[0];
    if (!Array.isArray(commands)) return;

    commands.forEach(command => {
      normalizeCommandPath(command);
    });
  });
});
