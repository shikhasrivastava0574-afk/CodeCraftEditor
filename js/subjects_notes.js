export const subjectNotes = {
  oops: {
    title: "Object-Oriented Programming (OOPS)",
    topics: [
      {
        name: "4 Pillars of OOPs",
        content: `### 1. Encapsulation
- **Definition**: Binding data (variables) and code (methods) together into a single unit (class) and restricting direct access to some components (information hiding).
- **Implementation**: Use \`private\` or \`protected\` access modifiers, providing \`public\` getters and setters.

### 2. Abstraction
- **Definition**: Hiding internal implementation details and showing only the essential features to the outside world.
- **Implementation**: Abstract classes and Interfaces.

### 3. Inheritance
- **Definition**: Mechanism where one class acquires the properties and behaviors of a parent class.
- **Types**: Single, Multiple (supported via interfaces in Java), Multilevel, Hierarchical, Hybrid.

### 4. Polymorphism
- **Definition**: The ability of a message or function to be processed in more than one form.
- **Types**:
  1. **Compile-time (Static)**: Method Overloading (same name, different parameters).
  2. **Run-time (Dynamic)**: Method Overriding (child class overrides parent class method, resolved at runtime via virtual tables).`
      },
      {
        name: "Abstract Class vs Interface",
        content: `### Abstract Class
- Can have abstract and concrete methods.
- Can have instance variables (state).
- A class can extend only one abstract class (Single inheritance).
- Uses keyword \`abstract\`.

### Interface
- Historically only had abstract methods (Java 8 added default/static methods).
- Variables are implicitly \`public static final\`.
- A class can implement multiple interfaces.
- Used to define a contract/behavior.`
      },
      {
        name: "SOLID Principles",
        content: `### SOLID Design Guidelines
1. **S - Single Responsibility Principle (SRP)**: A class should have one, and only one, reason to change.
2. **O - Open/Closed Principle (OCP)**: Software entities should be open for extension but closed for modification.
3. **L - Liskov Substitution Principle (LSP)**: Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.
4. **I - Interface Segregation Principle (ISP)**: Clients should not be forced to depend on interfaces they do not use.
5. **D - Dependency Inversion Principle (DIP)**: High-level modules should not depend on low-level modules; both should depend on abstractions.`
      }
    ]
  },
  dbms: {
    title: "Database Management Systems (DBMS)",
    topics: [
      {
        name: "ACID Properties",
        content: `### Transactions: ACID Model
- **A - Atomicity**: "All or nothing". Either the entire transaction succeeds, or it is completely rolled back.
- **C - Consistency**: A transaction must transition the database from one valid state to another, maintaining all integrity constraints.
- **I - Isolation**: Transactions execute concurrently without interfering with each other. Concurrency levels depend on isolation settings (Read Uncommitted, Read Committed, Repeatable Read, Serializable).
- **D - Durability**: Once a transaction is committed, its changes are permanently written to disk and survive system crashes.`
      },
      {
        name: "Database Normalization",
        content: `### Eliminating Redundancy
- **1NF (First Normal Form)**: Attributes must contain atomic (indivisible) values. No repeating groups.
- **2NF (Second Normal Form)**: Must be in 1NF. All non-prime attributes must be fully functionally dependent on the primary key (no partial dependencies).
- **3NF (Third Normal Form)**: Must be in 2NF. No transitive dependencies (a non-prime attribute depends on another non-prime attribute).
- **BCNF (Boyce-Codd Normal Form)**: Strict version of 3NF. For every functional dependency $X \\rightarrow Y$, $X$ must be a super key.`
      },
      {
        name: "SQL vs NoSQL Databases",
        content: `### Database Paradigms
| Feature | Relational (SQL) | Non-Relational (NoSQL) |
|---|---|---|
| **Data Model** | Structured tables (rows/columns) | Key-value, Document, Graph, Columnar |
| **Schema** | Rigid, predefined | Dynamic, flexible |
| **Scaling** | Vertical (scale up hardware) | Horizontal (scale out cluster) |
| **Transactions**| Focuses on ACID properties | Focuses on BASE (Basically Available, Soft-state, Eventual consistency) |
| **Examples** | PostgreSQL, MySQL, SQLite | MongoDB, Redis, Cassandra, Neo4j |`
      }
    ]
  },
  cn: {
    title: "Computer Networks (CN)",
    topics: [
      {
        name: "OSI Model vs TCP/IP",
        content: `### 7 Layers of OSI Model
1. **Physical Layer**: Bit stream transmission over physical medium (cables, hubs).
2. **Data Link Layer**: Node-to-node transfer, framing, MAC addressing, error detection (Ethernet, switches).
3. **Network Layer**: Routing packets across networks, logical addressing (IP, routers).
4. **Transport Layer**: End-to-end communication, flow control, segmentation (TCP, UDP).
5. **Session Layer**: Manages sessions between applications.
6. **Presentation Layer**: Data formatting, encryption, compression.
7. **Application Layer**: User interaction protocol layer (HTTP, DNS, FTP, SMTP).`
      },
      {
        name: "TCP vs UDP Protocols",
        content: `### Transport Layer Protocols
- **TCP (Transmission Control Protocol)**:
  - Connection-oriented (requires 3-way handshake: SYN, SYN-ACK, ACK).
  - Reliable (acknowledgements, retransmissions, flow control).
  - Heavy header overhead (minimum 20 bytes).
  - Used in: HTTP, FTP, SSH, SMTP.
- **UDP (User Datagram Protocol)**:
  - Connectionless (sends packet stream directly without session establish).
  - Unreliable (best-effort delivery, packets can be lost/out-of-order).
  - Lightweight (8-byte header).
  - Used in: Video streaming, DNS, VoIP, gaming.`
      },
      {
        name: "HTTP vs HTTPS Protocols",
        content: `### Hypertext Transfer Protocol Secure
- **HTTP**: Transmits data in plaintext. Port 80.
- **HTTPS**: Encrypts traffic using TLS/SSL protocols. Port 443.
- **TLS Handshake**:
  1. Client sends "Client Hello" (cipher suites supported).
  2. Server responds with "Server Hello", its public certificate, and key exchange details.
  3. Client validates the certificate with trusted CAs.
  4. Symmetric session keys are generated securely to encrypt subsequent traffic.`
      }
    ]
  },
  os: {
    title: "Operating Systems (OS)",
    topics: [
      {
        name: "Process vs Thread",
        content: `### Execution Contexts
- **Process**:
  - An executing instance of a program.
  - Owns its memory space (code, data, heap, system resources).
  - Process creation is expensive; context switching has high overhead.
- **Thread**:
  - A lightweight process, unit of execution inside a process.
  - Shares the parent process's memory space and heap.
  - Has its own stack, PC (Program Counter), and registers.
  - Context switching is fast; sharing data is simple but requires synchronization to prevent race conditions.`
      },
      {
        name: "Deadlocks",
        content: `### Mutual Blockage
- **Definition**: A state where a set of processes are blocked because each process holds a resource and waits for another resource held by some other process.
- **4 Coffman Conditions (Must hold simultaneously)**:
  1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
  2. **Hold and Wait**: A process holding resources can request new resources without releasing its current ones.
  3. **No Preemption**: Resources cannot be forcibly taken from a process.
  4. **Circular Wait**: A closed loop of processes exists where each process waits for a resource held by the next.
- **Prevention**: Break any one of the Coffman conditions (e.g. require resources to be requested all at once or in a global ordering).`
      },
      {
        name: "Paging & Virtual Memory",
        content: `### Memory Management
- **Paging**: Dividing physical memory into fixed-size blocks (Frames) and logical memory into blocks of the same size (Pages). Eliminates external fragmentation.
- **Virtual Memory**: Technique that allows the execution of processes that are not completely in physical memory. Maps virtual addresses used by program to physical addresses using a Page Table.
- **Page Fault**: Occurs when a program accesses a page that is mapped in virtual address space but not loaded in physical RAM. Triggers OS to fetch page from disk swapping area.`
      }
    ]
  }
};
