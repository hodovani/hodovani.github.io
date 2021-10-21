#### What is Maven?

Maven is a build tool in the Java ecosystem, and one of its core features is dependency management.

#### What is transitive dependency?

Direct dependencies are the ones that are explicitly included in the project. These can be included in the project using <dependency> tags

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>1.0</version>
</dependency>
```

Transitive dependencies, on the other hand, are dependencies required by our direct dependencies. Required transitive dependencies are automatically included in our project by Maven.
  
We can list all dependencies including transitive dependencies in the project using: mvn dependency:tree command.

#### What is Dependency Scopes?
  
Dependency scopes can help to limit transitivity of the dependencies and they modify classpath for different built tasks. Maven has 6 default dependency scopes.

And it's important to understand that each scope – except for import – does have an impact on transitive dependencies.
  
#### Compile Dependency Scope
  
__This is the default scope when no other scope is provided.__

Dependencies with this scope are available on the classpath of the project in all build tasks and they're propagated to the dependent projects.
  
More importantly, these dependencies are also transitive:
  
```xml
<dependency>
    <groupId>dependencyGroupId</groupId>
    <artifactId>dependencyArtifactId</artifactId>
    <version>1.0</version>
</dependency>
```
  
#### Provided Dependency Scope
  
This scope is used to mark dependencies that should be provided at runtime by JDK or a container, hence the name.

A good use case for this scope would be a web application deployed in some container, where the container already provides some libraries itself.

For example, a web server that already provides the Servlet API at runtime, thus in our project, those dependencies can be defined with the provided scope:

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>servlet-api</artifactId>
    <version>2.5</version>
    <scope>provided</scope>
</dependency>
```

The provided dependencies are available only at compile-time and in the test classpath of the project; what's more, they aren't transitive.
  
#### Runtime Dependency Scope
  
The dependencies with this scope are required at runtime, but they're not needed for compilation of the project code. Because of that, dependencies marked with the runtime scope will be present in runtime and test classpath, but they will be missing from compile classpath.

A good example of dependencies that should use the runtime scope is a JDBC driver:

```xml  
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>6.0.6</version>
    <scope>runtime</scope>
</dependency>
```

#### Test Dependency Scope
  
This scope is used to indicate that dependency isn't required at standard runtime of the application, but is used only for test purposes. Test dependencies aren't transitive and are only present for test and execution classpaths.

The standard use case for this scope is adding test library like JUnit to our application:
  
```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.12</version>
    <scope>test</scope>
</dependency>
```
  
#### System Dependency Scope
  
system scope is much similar to the provided scope. The main difference between those two scopes is that system requires us to directly point to a specific jar on the system.

It's worthwhile to mention that system scope is deprecated.

The important thing to remember is that building the project with system scope dependencies may fail on different machines if dependencies aren't present or are located in a different place than the one systemPath points to:

```xml
<dependency>
    <groupId>com.baeldung</groupId>
    <artifactId>custom-dependency</artifactId>
    <version>1.3.2</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/libs/custom-dependency-1.3.2.jar</systemPath>
</dependency>
```
  
#### Import Dependency Scope
  
This scope was added in Maven 2.0.9 and it's only available for the dependency type pom. We're going to speak more about the type of the dependency in future articles.

Import indicates that this dependency should be replaced with all effective dependencies declared in it's POM:

```xml
<dependency>
    <groupId>com.baeldung</groupId>
    <artifactId>custom-project</artifactId>
    <version>1.3.2</version>
    <type>pom</type>
    <scope>import</scope>
</dependency>
```
  
#### How Scope affect Transitivity?
  
Each dependency scope affects transitive dependencies in its own way. This means that different transitive dependencies may end up in the project with different scopes.

However, dependencies with scopes provided and test will never be included in the main project.

Then:

For the compile scope, all dependencies with runtime scope will be pulled in with the runtime scope, in the project and all dependencies with the compile scope will be pulled in with the compile scope, in the project
For the provided scope, both runtime and compile scope dependencies will be pulled in with the provided scope, in the project
For the test scope, both runtime and compile scope transitive dependencies will be pulled in with the test scope, in the project
For the runtime scope, both runtime and compile scope transitive dependencies will be pulled in with the runtime scope, in the project
