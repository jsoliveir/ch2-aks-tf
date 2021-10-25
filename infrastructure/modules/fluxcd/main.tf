terraform {
  required_providers {
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = ">= 1.13.0"
    }
    kubernetes = {
      source = "hashicorp/kubernetes"
      version = "2.6.1"
    }
    flux = {
      source  = "fluxcd/flux"
      version = ">= 0.5.1"
    }
  }
}

provider "kubernetes" {
    host                   = var.kubernetes.host
    client_key             = var.kubernetes.client_key
    client_certificate     = var.kubernetes.client_certificate
    cluster_ca_certificate = var.kubernetes.cluster_ca_certificate
}

provider "kubectl" {
    host                   = var.kubernetes.host
    client_key             = var.kubernetes.client_key
    client_certificate     = var.kubernetes.client_certificate
    cluster_ca_certificate = var.kubernetes.cluster_ca_certificate
}

resource "kubernetes_namespace" "flux_system" {
  count      = var.active ? 1 : 0
  metadata {
    name = "flux-system"
  }
}

data "flux_install" "main" {
  target_path   = var.config.repository_path
}

data "flux_sync" "main" {
  branch      = var.config.repository_branch
  target_path = var.config.repository_path
  url         = var.config.repository
}

locals {
  flux_install_docs = split("-*-", trim(replace(data.flux_install.main.content, "/---\n/", "-*-"), "-*-"))
  flux_sync_docs    = split("-*-", trim(replace(data.flux_sync.main.content, "/---\n/", "-*-"), "-*-"))
}

resource "kubectl_manifest" "install" {
  count      = var.active ? length(local.flux_install_docs) : 0
  yaml_body  = local.flux_install_docs[count.index]
  depends_on = [
    kubernetes_namespace.flux_system.0
  ]
}

resource "kubectl_manifest" "sync" {
  count      = var.active ? length(local.flux_sync_docs) : 0
  yaml_body  = local.flux_sync_docs[count.index]
  depends_on = [
    kubernetes_namespace.flux_system.0, 
    kubectl_manifest.install.0
  ]
}

resource "kubernetes_secret" "main" {
  count      = var.active ? 1 : 0
  depends_on = [kubectl_manifest.install.0]
  metadata {
    name      = data.flux_sync.main.secret
    namespace = data.flux_sync.main.namespace
  }
}