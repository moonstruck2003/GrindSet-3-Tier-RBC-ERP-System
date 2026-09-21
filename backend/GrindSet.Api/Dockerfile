# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["GrindSet.Api.csproj", "./"]
RUN dotnet restore "GrindSet.Api.csproj"

# Copy all source files and publish release
COPY . .
RUN dotnet publish "GrindSet.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Default ASP.NET Core listening port
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "GrindSet.Api.dll"]
