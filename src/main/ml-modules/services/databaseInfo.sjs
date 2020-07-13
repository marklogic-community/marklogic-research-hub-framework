
  function get(context, params) {
    return {
      'modulesDatabaseID':  xdmp.modulesDatabase(),
      'modulesDatabaseName': xdmp.databaseName( xdmp.modulesDatabase()),
      'databaseName': xdmp.databaseName(xdmp.database()),
      'databaseID': xdmp.database(),
      'serverID': xdmp.server(),
      'serverName': xdmp.serverName(xdmp.server()),
      'groupID': xdmp.serverGroup(xdmp.server()),
      'groupName': xdmp.groupName(),
      'hostName': xdmp.hostName(),
      'hostID': xdmp.host(xdmp.hostName())
    }
  };
  
exports.GET = get;