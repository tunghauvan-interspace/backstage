# Podcast System Architecture

```mermaid
graph TD
    %% Define the Domain
    subgraph Domain["Domain: playback"]
        %% Define the System
        subgraph System["System: podcast"]
            %% Define the Component
            Component["Component: podcast-player\n(service)"]
            
            %% Define Resources
            DB1["Resource: podcast-player-db-1\n(database)"]
            DB2["Resource: podcast-player-db-2\n(database)"]
            
            %% Show dependencies
            DB1 --> Component
            DB2 --> Component
        end
    end
    
    %% Add ownership information
    Owner["Owner: guests"]
    Owner --> Domain
    Owner --> System
    Owner --> Component
    Owner --> DB1
    Owner --> DB2
    
    %% Add lifecycle information
    Lifecycle["Lifecycle: experimental"]
    Lifecycle --> Component
    Lifecycle --> DB1
    Lifecycle --> DB2
    
    %% Add styling
    classDef domain fill:#f9f,stroke:#333,stroke-width:2px;
    classDef system fill:#bbf,stroke:#33f,stroke-width:1px;
    classDef component fill:#bfb,stroke:#3b3,stroke-width:1px;
    classDef resource fill:#fbb,stroke:#b33,stroke-width:1px;
    classDef metadata fill:#fffacd,stroke:#ccc,stroke-width:1px;
    
    class Domain domain;
    class System system;
    class Component component;
    class DB1,DB2 resource;
    class Owner,Lifecycle metadata;
```

This diagram visually represents the architecture described in your podcast.yaml file, showing:
- A Domain (playback) containing 
- A System (podcast) containing
- A Component (podcast-player) with 
- Two database resources (podcast-player-db-1 and podcast-player-db-2) that the component depends on
- All entities share the same owner (guests)
- Component and resources have experimental lifecycle status
