provider "azurerm" {
  features {}
}

locals {
  tags = {
    "source" = "kubernetes"
    "environment" = var.environment
    "cluster" = var.cluster_name
  }
}

resource "azuread_application" "aks" {
  display_name = "${var.cluster_name}-${var.environment}-sp"
}

resource "azuread_service_principal" "aks" {
  application_id = "${azuread_application.aks.application_id}"
}

resource "azuread_service_principal_password" "aks" {
  service_principal_id = "${azuread_service_principal.aks.id}"
}

resource "azurerm_resource_group" "aks" {
  name     = "${var.cluster_name}-cluster-${var.environment}-rg"
  location = "${var.location}"
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                        = "${var.cluster_name}-${var.environment}-aks"
  node_resource_group         = "${var.cluster_name}-${var.environment}-rg"
  location                    = "${azurerm_resource_group.aks.location}"
  resource_group_name         = "${azurerm_resource_group.aks.name}" 
  kubernetes_version          = var.kubernetes_version 
  dns_prefix                  = var.cluster_name
  tags                        = local.tags
  
  network_profile {
    load_balancer_sku = "Standard"
    network_plugin    = "kubenet" 
  }

  default_node_pool {
    vm_size               = var.vm_size
    enable_node_public_ip = false
    name                  = "default"
    os_sku                = "Ubuntu" 
    os_disk_size_gb       = 30
    node_count            = 1
    tags                  = local.tags
  } 

  service_principal {
    client_id             = "${azuread_application.aks.application_id}"
    client_secret         = "${azuread_service_principal_password.aks.value}"
  }
}

provider "helm" {

  kubernetes {
    host                   = "${azurerm_kubernetes_cluster.aks.kube_config.0.host}"
    client_certificate     = "${base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_certificate)}"
    client_key             = "${base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_key)}"
    cluster_ca_certificate = "${base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.cluster_ca_certificate)}"
  }
}

resource "azurerm_public_ip" "nginx_ingress" {
  name                         = "nginx-ingress-pip"
  sku                          = azurerm_kubernetes_cluster.aks.network_profile.0.load_balancer_sku
  location                     = "${azurerm_kubernetes_cluster.aks.location}"
  resource_group_name          = "${azurerm_kubernetes_cluster.aks.node_resource_group}"
  domain_name_label            =  "${var.cluster_name}"
  allocation_method            =  "Static"
}

resource "helm_release" "nginx_ingress" {
  name       = "gateway"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "nginx-ingress-controller"

 set {
    name  = "service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "service.type"
    value = "LoadBalancer"
  }
  
  set {
    name  = "service.loadBalancerIP"
    value = "${azurerm_public_ip.nginx_ingress.ip_address}"
  }
}