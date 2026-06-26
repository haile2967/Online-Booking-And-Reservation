FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY ["online booking and reservation.csproj", "./"]
RUN dotnet restore "online booking and reservation.csproj"

# Copy everything else and build
COPY . .
RUN dotnet publish "online booking and reservation.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# Render exposes the port via the PORT environment variable
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "online booking and reservation.dll"]
