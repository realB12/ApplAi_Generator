# ApplaiGenerator SERVER Code

This folder remains as a reminder, that in an earlier design a dedicated backend-server was foreseen for authentication and file-management. This is no longer the case when wie have switched from GISTs to SupaBask Baskets. 

The "server" represents the Applai Generator's Backend-End which - in a future release might be called by the [ApplaiGenerator CLIENT](../client/_ApplaiGenerator%20CLIENT%20Code.md). 

However, the current Client does authentication and JSON-file handling against privately setupo SupaBase Buckets that can be fully accessed directly from clients without a need for a dedicated Backend Server. 

However, in a next phase this pragmatic test-server moight be replaced by a dedicated, full blown and maintained Backend-Server for better scalability, more security and better maintenance following best practices for large scale systems. 

