# Protein Analysis System - Class Diagram

## Overview

This class diagram illustrates the object-oriented design of the FastAPI-based protein analysis system. The diagram showcases the implementation of key OOP principles including inheritance, polymorphism, encapsulation, and the factory pattern. The system is designed to analyze protein sequences using different analysis algorithms while maintaining clean separation of concerns.

## System Architecture

### Core Components

The system is organized into three main layers:

1. **Business Logic Layer** - Core OOP classes implementing protein analysis algorithms
2. **Service Layer** - Orchestration and caching services  
3. **Data Transfer Layer** - Pydantic models for API communication

## Class Descriptions

### 🟡 Abstract Base Classes

#### `BaseProteinAnalyzer`
- **Type**: Abstract base class
- **Purpose**: Defines the common interface and shared functionality for all protein analyzers
- **Key Features**:
  - Encapsulates protein sequence data and validation logic
  - Provides shared methods for amino acid composition analysis
  - Implements lazy loading for expensive BioPython operations
  - Enforces contract through abstract `analyze()` method

**Private Members** (Encapsulation):
- `_sequence`: Stores the protein sequence
- `_analyzed_sequence`: Cached BioPython ProteinAnalysis object
- `_validation_errors`: List of validation issues

**Public Interface**:
- `analyze()`: Abstract method for analysis (implemented by subclasses)
- `get_basic_properties()`: Returns common protein properties
- Properties for sequence access and validation status

### 🔵 Concrete Analyzer Classes

#### `BasicProteinAnalyzer`
- **Type**: Concrete implementation
- **Purpose**: Performs essential protein analysis calculations
- **Inheritance**: Extends `BaseProteinAnalyzer`
- **Analysis Scope**: Basic properties (length, molecular weight, isoelectric point, amino acid composition)

#### `AdvancedProteinAnalyzer`
- **Type**: Concrete implementation  
- **Purpose**: Performs comprehensive protein analysis
- **Inheritance**: Extends `BaseProteinAnalyzer`
- **Analysis Scope**: All basic properties plus advanced calculations (aromaticity, stability, secondary structure, etc.)

### 🟣 Design Pattern Classes

#### `ProteinAnalysisFactory`
- **Type**: Factory class (Static methods)
- **Purpose**: Creates appropriate analyzer instances based on analysis type
- **Pattern**: Factory Method Pattern
- **Key Methods**:
  - `create_analyzer()`: Returns correct analyzer type based on input
  - `get_supported_types()`: Lists available analysis types

#### `ProteinAnalysisService`
- **Type**: Service class
- **Purpose**: Orchestrates protein analysis operations with caching
- **Key Features**:
  - Manages analyzer instances and results caching
  - Handles batch processing of multiple sequences
  - Provides cache management operations

**Private Members** (Encapsulation):
- `_analyzers`: Collection of created analyzer instances
- `_results_cache`: Cache for analysis results
- `_factory`: Factory instance for creating analyzers

### 🟢 Pydantic Data Models

#### `ProteinAnalysisRequest`
- **Type**: Input model
- **Purpose**: Validates and structures incoming API requests
- **Fields**: 
  - `sequences`: List of protein sequences to analyze
  - `analysis_type`: Type of analysis to perform

#### `ProteinAnalysisResult`
- **Type**: Domain model
- **Purpose**: Represents the complete analysis results for a single protein
- **Fields**: Comprehensive set of protein properties (both basic and advanced)

#### `ProteinAnalysisResponse`
- **Type**: Output model
- **Purpose**: Structures API response containing analysis results
- **Fields**: 
  - `results`: List of `ProteinAnalysisResult` objects

### 🟡 API Response Models

#### `AuthCheckResponse`
- **Purpose**: Response for authentication verification
- **Fields**: Authentication status and user information

#### `ErrorResponse`
- **Purpose**: Standardized error response format
- **Fields**: Error details and messages

#### `HealthCheckResponse`
- **Purpose**: Health check endpoint response
- **Fields**: Service status information

## Relationships and Patterns

### Inheritance Hierarchy
```
BaseProteinAnalyzer (Abstract)
├── BasicProteinAnalyzer
└── AdvancedProteinAnalyzer
```

**Demonstrates**: 
- **Inheritance**: Child classes inherit common functionality
- **Polymorphism**: Both implementations provide their own `analyze()` method
- **Abstract Base Class**: Enforces consistent interface across implementations

### Composition Relationships

#### `ProteinAnalysisService` contains:
- **`ProteinAnalysisFactory`** (Composition): Service owns and manages factory instance
- **`List[BaseProteinAnalyzer]`** (Aggregation): Service stores references to analyzer instances

### Association Relationships

#### Creation and Usage Flow:
1. **Factory creates analyzers**: `ProteinAnalysisFactory` → `BaseProteinAnalyzer`
2. **Analyzers return results**: `BaseProteinAnalyzer` → `ProteinAnalysisResult`
3. **Service orchestrates**: `ProteinAnalysisService` → `ProteinAnalysisResult`
4. **Response contains results**: `ProteinAnalysisResponse` → `ProteinAnalysisResult`

### Data Flow

#### Request Processing:
```
ProteinAnalysisRequest → ProteinAnalysisService → ProteinAnalysisResponse
```

The service receives requests, uses the factory to create appropriate analyzers, processes sequences, and returns structured responses.

## Object-Oriented Principles Demonstrated

### 1. **Encapsulation**
- Private fields and methods (prefixed with `_`)
- Public interfaces through properties and methods
- Internal state management hidden from external classes

### 2. **Inheritance**
- `BaseProteinAnalyzer` provides common functionality
- Concrete classes extend and specialize behavior
- Shared code reuse through inheritance hierarchy

### 3. **Polymorphism**
- Multiple implementations of `analyze()` method
- Factory returns different concrete types through common interface
- Service works with any `BaseProteinAnalyzer` implementation

### 4. **Abstraction**
- Abstract base class defines contract
- Complex analysis logic hidden behind simple interfaces
- Service layer abstracts analyzer creation and management

## Design Patterns Used

### Factory Method Pattern
- `ProteinAnalysisFactory` encapsulates object creation logic
- Clients don't need to know about concrete analyzer types
- Easy to extend with new analysis types

### Service Layer Pattern
- `ProteinAnalysisService` provides high-level operations
- Manages cross-cutting concerns (caching, batch processing)
- Decouples business logic from presentation layer

## Color Coding

- **🟡 Yellow**: Abstract classes and API response models
- **🔵 Light Blue**: Concrete analyzer implementations
- **🟣 Purple**: Factory and service classes
- **🟢 Green**: Pydantic data transfer objects

## Usage Instructions

### Loading the Diagram
1. Open [Excalidraw](https://excalidraw.com)
2. Click "Open" in the menu
3. Select the `protein_analysis_class_diagram.excalidraw.json` file
4. The diagram will load with all classes and relationships

### Reading the Diagram
- **Solid arrows with triangular heads**: Inheritance relationships
- **Solid arrows with diamond heads**: Composition/aggregation relationships
- **Dashed arrows**: Association and dependency relationships
- **Text in `<<>>` brackets**: Stereotypes (abstract, static, Pydantic)

## Benefits of This Design

1. **Maintainability**: Clear separation of concerns and well-defined interfaces
2. **Extensibility**: Easy to add new analysis types or modify existing ones
3. **Testability**: Each class has focused responsibilities and clear dependencies
4. **Reusability**: Common functionality shared through inheritance
5. **Performance**: Caching and lazy loading optimize resource usage

This class diagram serves as a blueprint for understanding the system architecture and can be used for code review, documentation, and future development planning. 
