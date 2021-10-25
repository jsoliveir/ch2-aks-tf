variable "kubernetes" {
    type = object({  
        host                   = string
        client_key             = string
        client_certificate     = string
        cluster_ca_certificate = string
    })
}

variable "config" {
    type = object({
        namespace = string
        repository = string
        repository_path = string
        repository_branch = string
    })
}