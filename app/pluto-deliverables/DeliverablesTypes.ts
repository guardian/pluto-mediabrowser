/*
This file defines interfaces that are used by the Deliverables REST API.
See the pluto-deliverables repository for more information.
 */
/**
 * "Project" actually refers to the deliverable bundle
 */
interface Project {
  pk: number; //primary-key, i.e. the record ID
  project_id: string; //this field is deprecated
  pluto_core_project_id: number; //this is now the correct project id
  commission_id: number;
  name: string;
  created: string;
  local_open_uri: string;
  local_path: string;
}

/**
 * The API can give us DeliverableAsset objects in two formats - raw or denormalised.
 * The former refers to sub-objects by IDs, while the latter contains a copy of the sub-object information at the point
 * in time that the record was retrieved.
 * BaseDeliverable contains the fields that are common to both; Deliverable extends BaseDeliverable and contains the fields
 * for a raw DeliverableAsset and DenormalisedDeliverable returns fields for a denormalised records
 */
interface BaseDeliverable {
  id: bigint;
  type: number | null;
  filename: string;
  size: bigint;
  access_dt: string;
  modified_dt: string;
  changed_dt: string;
  job_id: string | null;
  online_item_id: string | null;
  nearline_item_id: string | null;
  archive_item_id: string | null;
  has_ongoing_job: boolean | null;
  status: bigint;
  type_string: string | null;
  version: bigint | null;
  duration: string | null;
  size_string: string;
  status_string: string;
  atom_id: string | null;
  absolute_path: string | null;
  linked_to_lowres: boolean | null;
}

interface DenormalisedDeliverable extends BaseDeliverable {
  deliverable?: Project;
  gnm_website_master?: GuardianMaster;
  youtube_master?: YoutubeMaster;
  DailyMotion_master?: DailymotionMaster;
  mainstream_master?: MainstreamMaster;
  oovvuu_master?: OovvuuMaster;
  reutersconnect_master?: ReutersConnectMaster;
}

interface CreateGuardianMaster {
  production_office: string;
  tags: string[];
  website_title: string;
  website_description: string;
  primary_tone: string;
}

interface GuardianMaster extends CreateGuardianMaster {
  etag?: string;
  media_atom_id?: string;
  upload_status: string;
  publication_date: string;
  publication_status: string;
}

interface CreateYoutubeMaster {
  youtube_id: string;
  youtube_title: string;
  youtube_description: string;
  youtube_tags: string[];
}

interface YoutubeMaster extends CreateYoutubeMaster {
  etag?: string;
  publication_date: string;
  youtube_category?: string;
  youtube_channel?: string;
}

interface CreateDailymotionMaster {
  daily_motion_url: string;
  daily_motion_title: string;
  daily_motion_description: string;
  daily_motion_tags: string[];
  daily_motion_no_mobile_access: boolean;
  daily_motion_contains_adult_content: boolean;
  daily_motion_category: string;
}

interface OovvuuMaster extends CreateOovvuuMaster {
  etag: string;
}

interface CreateOovvuuMaster {
  seen_on_channel: boolean;
}

interface CreateReutersConnectMaster {
  seen_on_channel: boolean;
}

interface ReutersConnectMaster extends CreateReutersConnectMaster {
  etag: string;
}
interface DailymotionMaster extends CreateDailymotionMaster {
  etag?: string;
  publication_date: string;
  upload_status: string;
}

interface CreateMainstreamMaster {
  mainstream_title: string;
  mainstream_description: string;
  mainstream_tags: string[];
  mainstream_rules_contains_adult_content: boolean;
  publication_date?: string;
}

interface MainstreamMaster extends CreateMainstreamMaster {
  etag?: string;
  upload_status: string;
}

interface DeliverablesResponseWrapper<T> {
  status: string;
  data: T;
}

export type {
  BaseDeliverable,
  DenormalisedDeliverable,
  DeliverablesResponseWrapper,
};
